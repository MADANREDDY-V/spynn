-- ============================================================================
-- SPYNN DRY CLEANING STUDIO — ISOLATED COMMUNITY DIRECTORY SCHEMA
-- Dedicated storage for public community discovery & /community-admin.
-- ISOLATED: Zero connection to SPYNN Billing customers, orders, or auth tables.
-- ============================================================================

-- 1. Create Dedicated Communities Table
create table if not exists public.spynn_communities (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  location text not null,
  assigned_store text not null default 'Narsingi Studio',
  phone text, -- optional, if omitted UI renders graceful contact-unavailable message
  whatsapp text, -- optional, if omitted UI renders graceful contact-unavailable message
  store_address text, -- optional
  is_active boolean not null default true,
  services jsonb not null default '["Dry Cleaning", "Steam Ironing", "Wash & Fold", "Shoe Cleaning", "Household Item Cleaning", "Curtain Cleaning"]'::jsonb,
  estimated_pickup text not null default 'Same Day Collection',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Performance Search Indexes
create index if not exists idx_spynn_communities_slug on public.spynn_communities (slug);
create index if not exists idx_spynn_communities_location on public.spynn_communities (location);
create index if not exists idx_spynn_communities_assigned_store on public.spynn_communities (assigned_store);
create index if not exists idx_spynn_communities_active on public.spynn_communities (is_active);

-- 3. Row Level Security (RLS)
alter table public.spynn_communities enable row level security;

-- Drop previous policies if re-running
drop policy if exists "Public visitors can view active communities" on public.spynn_communities;
drop policy if exists "Service role and admins have full management access" on public.spynn_communities;

-- Policy 1: Public Read Access (Anyone can view active communities)
create policy "Public visitors can view active communities"
  on public.spynn_communities
  for select
  using (is_active = true);

-- Policy 2: Admin Full Access (Controlled via Service Role or Server-Side API)
create policy "Service role and admins have full management access"
  on public.spynn_communities
  for all
  using (auth.role() = 'service_role' or auth.uid() in (
    select id from public.profiles where role = 'admin'
  ));

-- 4. Initial Seed Data (5 Verified Communities)
insert into public.spynn_communities (id, slug, name, location, assigned_store, phone, whatsapp, store_address, is_active)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'gardenia-florence-villas',
    'Gardenia Florence Villas',
    'Tellapur',
    'Narsingi Studio',
    '+91 98666 35661',
    '919866635661',
    'Main Road, Narsingi, Hyderabad',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'hallmark-skyrena',
    'Hallmark Skyrena',
    'Puppalaguda',
    'Narsingi Studio',
    '+91 98666 35661',
    '919866635661',
    'Main Road, Narsingi, Hyderabad',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'hallmark-treasor',
    'Hallmark Treasor',
    'Alkapur Township',
    'Narsingi Studio',
    '+91 98666 35661',
    '919866635661',
    'Main Road, Narsingi, Hyderabad',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'vessella-meadows',
    'Vessella Meadows',
    'Narsingi',
    'Narsingi Studio',
    '+91 98666 35661',
    '919866635661',
    'Main Road, Narsingi, Hyderabad',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'girija-marvel-chandanagar',
    'Girija Marvel — Chandanagar',
    'Chandanagar',
    'Chandanagar Studio',
    '+91 98666 35661',
    '919866635661',
    'Chandanagar Main Road, Hyderabad',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  location = excluded.location,
  assigned_store = excluded.assigned_store,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  store_address = excluded.store_address,
  is_active = excluded.is_active;
