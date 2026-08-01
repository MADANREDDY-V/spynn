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
