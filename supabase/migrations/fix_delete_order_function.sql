-- =============================================================================
-- SPYNN Billing Software – Fix delete_billing_order_by_number Function
-- File: supabase/migrations/fix_delete_order_function.sql
--
-- PURPOSE:
--   Update public.delete_billing_order_by_number to resolve customer name via
--   LEFT JOIN with public.billing_customers (c.full_name) instead of querying
--   non-existent column billing_orders.customer_name.
--   Uses FOR UPDATE OF o to strictly lock the target billing_orders row.
--
-- PERMISSIONS:
--   SECURITY DEFINER with SET search_path = ''
--   Execution revoked from PUBLIC and anon; granted to authenticated.
-- =============================================================================

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
-- Function execution permissions
-- ---------------------------------------------------------------------------
revoke execute on function public.delete_billing_order_by_number(text, text)
  from public;

revoke execute on function public.delete_billing_order_by_number(text, text)
  from anon;

grant execute on function public.delete_billing_order_by_number(text, text)
  to authenticated;

comment on function public.delete_billing_order_by_number(text, text) is
  'Securely deletes a billing order and its items by order number and records an audit log atomically. Restricted to active owners in billing_staff.';
