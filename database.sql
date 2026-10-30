-- Run this SQL in your Supabase SQL Editor to set up the database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (For Admin & Agents)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'agent')) default 'agent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Communities Table
create table public.communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  slug text unique not null,
  status text check (status in ('available', 'coming_soon')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Pickup Requests Table
create table public.pickup_requests (
  id uuid default uuid_generate_v4() primary key,
  booking_id text unique not null,
  full_name text not null,
  mobile_number text not null,
  alternate_mobile text,
  email text,
  community_id uuid references public.communities(id),
  tower text,
  flat_number text,
  landmark text,
  pickup_date date not null,
  pickup_time text not null,
  services jsonb not null, -- Array of selected services
  approximate_garments integer,
  special_instructions text,
  status text check (status in ('pending', 'confirmed', 'picked_up', 'in_process', 'ready_for_delivery', 'delivered', 'cancelled')) default 'pending',
  stain_analysis jsonb, -- To store AI analysis result if Agent adds it
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Communities
alter table public.communities enable row level security;
create policy "Communities are viewable by everyone." on communities for select using (true);
create policy "Only admins can modify communities." on communities for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Pickup Requests
alter table public.pickup_requests enable row level security;
-- Customers can view their request if they know the booking_id (handled in API/Edge functions)
create policy "Anyone can insert a pickup request." on pickup_requests for insert with check (true);
create policy "Admins and Agents can view all pickup requests." on pickup_requests for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can update pickup requests." on pickup_requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'agent');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Community Requests Table
create table public.community_requests (
  id uuid default uuid_generate_v4() primary key,
  community_name text not null,
  area text not null,
  number_of_flats text,
  contact_person text not null,
  phone text not null,
  email text not null,
  notes text,
  status text default 'pending',
  ip_address text,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Community Requests RLS
alter table public.community_requests enable row level security;
create policy "Anyone can insert a community request." on community_requests for insert with check (true);
create policy "Admins and Agents can view community requests." on community_requests for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can update community requests." on community_requests for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);

-- ============================================================================
-- 5. SPYNN Billing Module Schema
-- ============================================================================

-- 5.1 Billing Customers
create table if not exists public.billing_customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  mobile text not null,
  email text,
  address text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_billing_customers_mobile on public.billing_customers (mobile);
create index if not exists idx_billing_customers_name on public.billing_customers (name);

-- 5.2 Billing Orders
create table if not exists public.billing_orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references public.billing_customers(id) on delete set null,
  customer_name text not null,
  customer_mobile text not null,
  customer_address text,
  subtotal numeric(12,2) not null default 0.00,
  discount_percent numeric(5,2) not null default 0.00,
  discount_amount numeric(12,2) not null default 0.00,
  total numeric(12,2) not null default 0.00,
  amount_paid numeric(12,2) not null default 0.00,
  balance numeric(12,2) not null default 0.00,
  payment_method text check (payment_method in ('Cash', 'Online', 'Split Payment')) default 'Cash',
  cash_amount numeric(12,2),
  online_amount numeric(12,2),
  order_status text check (order_status in ('Received', 'Processing', 'Ready', 'Delivered')) default 'Received',
  payment_status text check (payment_status in ('paid', 'partial', 'unpaid')) default 'unpaid',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_billing_orders_order_number on public.billing_orders (order_number);
create index if not exists idx_billing_orders_customer_id on public.billing_orders (customer_id);
create index if not exists idx_billing_orders_customer_mobile on public.billing_orders (customer_mobile);
create index if not exists idx_billing_orders_created_at on public.billing_orders (created_at desc);
create index if not exists idx_billing_orders_status on public.billing_orders (order_status, payment_status);

-- 5.3 Billing Order Items
create table if not exists public.billing_order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.billing_orders(id) on delete cascade not null,
  garment_name text not null,
  service text not null check (service in ('Dry Cleaning', 'Ironing', 'Shoe Cleaning', 'Household', 'Laundry')),
  category text,
  variant text,
  quantity numeric(10,2) not null default 1.00,
  unit_price numeric(10,2) not null default 0.00,
  unit text default 'item',
  line_total numeric(12,2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_billing_order_items_order_id on public.billing_order_items (order_id);
create index if not exists idx_billing_order_items_service on public.billing_order_items (service);

-- 5.4 Billing Garment Price Overrides / Master Catalogue
create table if not exists public.billing_garment_prices (
  id uuid default uuid_generate_v4() primary key,
  item_key text not null,
  service text not null check (service in ('Dry Cleaning', 'Ironing', 'Shoe Cleaning', 'Household', 'Laundry')),
  category text,
  garment_name text not null,
  variant text,
  price numeric(10,2) not null,
  unit text default 'item',
  is_active boolean default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint billing_garment_prices_item_unique unique (item_key)
);

create index if not exists idx_billing_garment_prices_service on public.billing_garment_prices (service);

-- ----------------------------------------------------------------------------
-- Billing Row Level Security (RLS)
-- ----------------------------------------------------------------------------

alter table public.billing_customers enable row level security;
create policy "Admins and Agents can view billing customers." on billing_customers for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can insert billing customers." on billing_customers for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can update billing customers." on billing_customers for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);

alter table public.billing_orders enable row level security;
create policy "Admins and Agents can view billing orders." on billing_orders for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can insert billing orders." on billing_orders for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can update billing orders." on billing_orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);

alter table public.billing_order_items enable row level security;
create policy "Admins and Agents can view billing order items." on billing_order_items for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can insert billing order items." on billing_order_items for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can update billing order items." on billing_order_items for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);

alter table public.billing_garment_prices enable row level security;
create policy "Admins and Agents can view billing garment prices." on billing_garment_prices for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
create policy "Admins and Agents can insert/update billing garment prices." on billing_garment_prices for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'agent'))
);
