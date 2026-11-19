-- =============================================================================
-- SPYNN Billing Software – Secure Order Deletion Migration
-- File: supabase/migrations/secure_order_deletion.sql
--
-- PURPOSE:
--   1. Explicitly enable Row Level Security (RLS) on:
--        • public.billing_orders
--        • public.billing_order_items
--   2. Explicitly REVOKE direct DELETE privileges on both billing tables from:
--        • PUBLIC, anon, authenticated
--      (SELECT, INSERT, and UPDATE privileges remain untouched).
--   3. Dynamically DROP all direct DELETE policies on billing_orders and
--      billing_order_items (via pg_policies DO block; creates NO replacement
--      DELETE policies).
--   4. Review FOR ALL policies: table-level DELETE privilege revocation ensures
--      no direct client deletions are possible even if an ALL policy exists.
--   5. Function Owner & SECURITY DEFINER Integrity:
--        • Function owner (postgres) retains table-level DELETE privileges on
--          billing_orders, billing_order_items, and INSERT on billing_audit_logs.
--        • Uses SECURITY DEFINER with SET search_path = ''
--        • Enforces auth.uid() authentication check
--        • Enforces public.billing_staff authorization (is_active = true and role = 'owner')
--        • Authoritative performed_by set from authenticated caller UUID auth.uid()
--        • Uses SELECT ... FOR UPDATE row locking
--        • Atomically deletes order items and order
--        • Commits audit log in the same transaction
--        • Execution granted only to authenticated role; revoked from PUBLIC & anon
--   6. Restrict audit log writes: direct INSERT, UPDATE, DELETE revoked from client roles;
--      audit writes occur exclusively via the trusted SECURITY DEFINER function.
--   7. Staff table alignment:
--        • Uses actual production schema: public.billing_staff (id, auth_user_id, role, is_active, store_id)
--        • Operates exclusively on billing_staff; does NOT create or modify staff tables.
--
-- SAFE TO APPLY:
--   • Idempotent: safe to execute multiple times.
--   • Non-destructive: contains NO table drops, NO data wiping, NO deletes of
--     existing billing data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Ensure billing_audit_logs exists with the exact schema columns:
--    action, entity_type, entity_id, details, performed_by, created_at.
-- ---------------------------------------------------------------------------
create table if not exists public.billing_audit_logs (
  id          uuid    default gen_random_uuid() primary key,
  action      text    not null,       -- 'DELETE_ORDER', 'CREATE_ORDER', etc.
  entity_type text    not null,       -- 'order'
  entity_id   text    not null,       -- order_number or order UUID as text
  details     jsonb,                  -- audit metadata snapshot
  performed_by text,                  -- authoritative actor (authenticated caller UUID)
  created_at  timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices (safe to re-run with IF NOT EXISTS)
create index if not exists idx_billing_audit_logs_action
  on public.billing_audit_logs (action);

create index if not exists idx_billing_audit_logs_entity
  on public.billing_audit_logs (entity_type, entity_id);

create index if not exists idx_billing_audit_logs_created_at
  on public.billing_audit_logs (created_at desc);

-- Enable Row Level Security
alter table public.billing_audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Audit Log Access Control:
--    - Authorised staff (active 'owner' in billing_staff) can READ audit logs.
--    - NO client-facing INSERT policy: prevents authenticated clients from
--      forging arbitrary audit records directly.
--    - Direct writes (INSERT, UPDATE, DELETE) revoked from anon & authenticated.
--    - Audit inserts happen exclusively through the trusted SECURITY DEFINER
--      function delete_billing_order_by_number.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins and Agents can view billing audit logs."   on public.billing_audit_logs;
drop policy if exists "Admins and Agents can insert billing audit logs." on public.billing_audit_logs;
drop policy if exists "Allow authenticated staff to insert billing audit logs" on public.billing_audit_logs;
drop policy if exists "Staff can view billing audit logs" on public.billing_audit_logs;
drop policy if exists "Authorized staff can view billing audit logs." on public.billing_audit_logs;

create policy "Authorized staff can view billing audit logs."
  on public.billing_audit_logs for select
  using (
    exists (
      select 1 from public.billing_staff
      where billing_staff.auth_user_id = auth.uid()
        and billing_staff.is_active = true
        and billing_staff.role = 'owner'
    )
  );

-- Revoke direct table manipulation from client roles
revoke insert, update, delete on table public.billing_audit_logs from public, anon, authenticated;
grant select on table public.billing_audit_logs to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Table-Level Privilege Hardening & Dynamic Removal of Direct DELETE Policies.
--
--    1. Explicitly enable Row Level Security on both billing tables.
--    2. Dynamically drop ALL direct DELETE policies via pg_policies.
--    3. Explicitly REVOKE direct DELETE privileges from PUBLIC, anon & authenticated.
--    4. SELECT, INSERT, and UPDATE privileges remain untouched.
--    5. NO replacement DELETE policies are created.
--    6. Any existing policies with cmd = 'ALL' (if present) are preserved for
--       SELECT, INSERT, and UPDATE, while direct DELETE is barred at table grant level.
--    7. Deletion occurs exclusively through the trusted SECURITY DEFINER
--       function delete_billing_order_by_number (running with function owner
--       privileges to perform atomic order + items deletion and audit insert).
-- ---------------------------------------------------------------------------
alter table public.billing_orders enable row level security;
alter table public.billing_order_items enable row level security;

do $$
declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('billing_orders', 'billing_order_items')
      and cmd = 'DELETE'
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

-- Revoke direct table DELETE privileges from client roles
revoke delete on table public.billing_orders from public, anon, authenticated;
revoke delete on table public.billing_order_items from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Replace stored procedure with the hardened secure implementation.
-- ---------------------------------------------------------------------------
create or replace function public.delete_billing_order_by_number(
  p_order_number text,
  p_performed_by text default null   -- optional display hint; NOT trusted for identity
)
returns jsonb
language plpgsql
security definer
set search_path = ''                 -- explicitly empty: prevents search_path injection
as $$
declare
  v_caller_uid    uuid;
  v_staff_role    text;
  v_is_active     boolean;
  v_audit_actor   text;

  v_order_id      uuid;
  v_customer_id   uuid;
  v_order_total   numeric;
  v_customer_name text;
begin

  -- -------------------------------------------------------------------------
  -- Step 1 – Authentication: reject unauthenticated / anonymous callers.
  -- -------------------------------------------------------------------------
  v_caller_uid := auth.uid();

  if v_caller_uid is null then
    return jsonb_build_object(
      'success', false,
      'error',   'Unauthenticated: you must be logged in to delete an order.'
    );
  end if;

  -- -------------------------------------------------------------------------
  -- Step 2 – Authorisation: verify staff record in public.billing_staff.
  --           Must match auth_user_id = auth.uid(), is_active = true,
  --           and role = 'owner'.
  -- -------------------------------------------------------------------------
  select role, is_active
  into   v_staff_role, v_is_active
  from   public.billing_staff
  where  auth_user_id = v_caller_uid;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error',   'Unauthorised: no staff record found for the authenticated user.'
    );
  end if;

  if v_is_active is not true then
    return jsonb_build_object(
      'success', false,
      'error',   'Unauthorised: staff account is inactive.'
    );
  end if;

  if v_staff_role <> 'owner' then
    return jsonb_build_object(
      'success', false,
      'error',   format(
        'Unauthorised: role "%s" does not have permission to delete orders.',
        v_staff_role
      )
    );
  end if;

  -- Authoritative identity: strictly verified authenticated UUID.
  -- Client-supplied p_performed_by is NEVER trusted as the audit actor.
  v_audit_actor := v_caller_uid::text;

  -- -------------------------------------------------------------------------
  -- Step 3 – Validate order number.
  -- -------------------------------------------------------------------------
  if p_order_number is null or trim(p_order_number) = '' then
    return jsonb_build_object(
      'success', false,
      'error',   'Invalid request: order number must not be empty.'
    );
  end if;

  -- -------------------------------------------------------------------------
  -- Step 4 – Locate the order, join customer, and acquire row-level lock on order.
  --           Note: customer_name is not on billing_orders; it is resolved via
  --           left join with public.billing_customers (full_name).
  --           FOR UPDATE OF o locks strictly the order row being deleted.
  -- -------------------------------------------------------------------------
  select o.id, o.customer_id, o.total, c.full_name
  into   v_order_id, v_customer_id, v_order_total, v_customer_name
  from   public.billing_orders o
  left join public.billing_customers c on c.id = o.customer_id
  where  o.order_number = trim(p_order_number)
  for update of o;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error',   format('Order "%s" does not exist in the database.', p_order_number)
    );
  end if;

  -- -------------------------------------------------------------------------
  -- Step 5 – Atomically delete associated items and the order record.
  -- -------------------------------------------------------------------------
  delete from public.billing_order_items
  where order_id = v_order_id;

  delete from public.billing_orders
  where id = v_order_id;

  -- -------------------------------------------------------------------------
  -- Step 6 – Audit log using authoritative server-verified identity.
  --           p_performed_by is stored only as a display-name hint in details.
  -- -------------------------------------------------------------------------
  insert into public.billing_audit_logs (
    action,
    entity_type,
    entity_id,
    details,
    performed_by
  ) values (
    'DELETE_ORDER',
    'order',
    p_order_number,
    jsonb_build_object(
      'order_id',          v_order_id,
      'customer_id',       v_customer_id,
      'customer_name',     v_customer_name,
      'total',             v_order_total,
      'auth_uid',          v_caller_uid,
      'staff_role',        v_staff_role,
      'display_name_hint', p_performed_by
    ),
    v_audit_actor
  );

  return jsonb_build_object(
    'success',              true,
    'deleted_order_number', p_order_number
  );

exception when others then
  -- Roll back partial changes and return safe error
  return jsonb_build_object(
    'success', false,
    'error',   'An internal error occurred while deleting the order. No data was changed.'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Restrict function execution permissions.
--    Revoke from public & anon; grant strictly to authenticated.
-- ---------------------------------------------------------------------------
revoke execute on function public.delete_billing_order_by_number(text, text)
  from public;

revoke execute on function public.delete_billing_order_by_number(text, text)
  from anon;

grant execute on function public.delete_billing_order_by_number(text, text)
  to authenticated;

comment on function public.delete_billing_order_by_number(text, text) is
  'Securely deletes a billing order and its items by order number and records an audit log atomically. Restricted to active owners in billing_staff.';

-- ---------------------------------------------------------------------------
-- END OF MIGRATION
-- =============================================================================
