-- GhostMap Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query → paste & run

-- Locations table
create table if not exists public.locations (
  id bigserial primary key,
  name text not null,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  description text not null default '',
  abandonment_score integer not null default 50,
  risk_level text not null default 'medium',
  last_visited text,
  submitted_by text,
  verification_state text not null default 'unverified',
  source_type text not null default 'user_submission',
  source_attribution text,
  closure_date text,
  building_status text,
  demolition_status text,
  created_at timestamptz not null default now()
);

-- Saved locations (many-to-many: auth.users <-> locations)
create table if not exists public.saved_locations (
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id bigint not null references public.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, location_id)
);

-- Explored locations
create table if not exists public.explored_locations (
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id bigint not null references public.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, location_id)
);

-- AI analysis cache
create table if not exists public.location_analysis (
  location_id text primary key,
  summary text,
  abandonment_score integer,
  decay_level integer,
  structural_integrity integer,
  activity_level integer,
  exploration_difficulty integer,
  ai_confidence integer,
  roof_deterioration integer,
  vegetation_overgrowth integer,
  parking_decay integer,
  risk_estimate text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.locations enable row level security;
alter table public.saved_locations enable row level security;
alter table public.explored_locations enable row level security;
alter table public.location_analysis enable row level security;

-- RLS: locations — anyone can read, authenticated users can insert
create policy "locations_read" on public.locations for select using (true);
create policy "locations_insert" on public.locations for insert with check (auth.uid() is not null);
create policy "locations_delete" on public.locations for delete using (auth.uid() is not null);
create policy "locations_update" on public.locations for update using (auth.uid() is not null);

-- RLS: saved_locations — users manage their own
create policy "saved_read" on public.saved_locations for select using (auth.uid() = user_id);
create policy "saved_insert" on public.saved_locations for insert with check (auth.uid() = user_id);
create policy "saved_delete" on public.saved_locations for delete using (auth.uid() = user_id);

-- RLS: explored_locations — users manage their own
create policy "explored_read" on public.explored_locations for select using (auth.uid() = user_id);
create policy "explored_insert" on public.explored_locations for insert with check (auth.uid() = user_id);
create policy "explored_delete" on public.explored_locations for delete using (auth.uid() = user_id);

-- RLS: location_analysis — anyone can read, service role writes
create policy "analysis_read" on public.location_analysis for select using (true);
create policy "analysis_upsert" on public.location_analysis for insert with check (true);
create policy "analysis_update" on public.location_analysis for update using (true);
