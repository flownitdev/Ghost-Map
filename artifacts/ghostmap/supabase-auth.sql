-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ssnmreynwwikmvrqvuhf/sql/new

-- 1. Add submitted_by column to locations (links sites to the user who added them)
alter table public.locations
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

-- 2. Create saved_locations table
create table if not exists public.saved_locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  location_id text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, location_id)
);

-- 3. Create explored_locations table
create table if not exists public.explored_locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  location_id text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, location_id)
);

-- 4. RLS for saved_locations
alter table public.saved_locations enable row level security;

create policy "Users can read own saved"
  on public.saved_locations for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved"
  on public.saved_locations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved"
  on public.saved_locations for delete
  using (auth.uid() = user_id);

-- 5. RLS for explored_locations
alter table public.explored_locations enable row level security;

create policy "Users can read own explored"
  on public.explored_locations for select
  using (auth.uid() = user_id);

create policy "Users can insert own explored"
  on public.explored_locations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own explored"
  on public.explored_locations for delete
  using (auth.uid() = user_id);

-- 6. Allow authenticated users to insert locations with their user_id
drop policy if exists "Public insert" on public.locations;

create policy "Authenticated insert"
  on public.locations for insert
  with check (true);

create policy "Update own locations"
  on public.locations for update
  using (auth.uid() = submitted_by);
