-- GhostMap AI Analysis Cache Table
-- Run this in your Supabase SQL editor

create table if not exists public.location_analysis (
  id uuid primary key default gen_random_uuid(),
  location_id text not null unique,
  summary text not null default '',
  abandonment_score integer not null default 0,
  decay_level integer not null default 0,
  structural_integrity integer not null default 50,
  activity_level integer not null default 0,
  exploration_difficulty integer not null default 50,
  ai_confidence integer not null default 80,
  roof_deterioration integer not null default 0,
  vegetation_overgrowth integer not null default 0,
  parking_decay integer not null default 0,
  risk_estimate text not null default 'medium',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.location_analysis enable row level security;

-- Public read access (analysis is not user-specific)
create policy "Anyone can read AI analysis"
  on public.location_analysis
  for select using (true);

-- Allow inserts/updates from any authenticated or anonymous user (frontend caches)
create policy "Anyone can insert AI analysis"
  on public.location_analysis
  for insert with check (true);

create policy "Anyone can update AI analysis"
  on public.location_analysis
  for update using (true);
