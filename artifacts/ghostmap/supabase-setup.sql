-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ssnmreynwwikmvrqvuhf/sql/new

-- 1. Create the locations table
create table if not exists public.locations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  latitude        double precision not null,
  longitude       double precision not null,
  description     text not null,
  abandonment_score integer not null default 50,
  risk_level      text not null default 'medium',
  last_visited    text,
  created_at      timestamptz not null default now()
);

-- 2. Enable Row Level Security (allow public read, no auth needed yet)
alter table public.locations enable row level security;

create policy "Public read"
  on public.locations for select
  using (true);

create policy "Public insert"
  on public.locations for insert
  with check (true);

-- 3. Seed with mock data
insert into public.locations
  (name, category, latitude, longitude, description, abandonment_score, risk_level, last_visited)
values
  ('Hôpital Militaire Abandonné', 'hospital', 48.8400, 2.3200,
   'A decommissioned military hospital frozen in 1987. Peeling paint, scattered medical files, and rows of empty iron beds still perfectly arranged.',
   91, 'high', '2024-11'),

  ('Usine Citroën Oubliée', 'factory', 48.8380, 2.2770,
   'A vast automobile factory silenced in the ''90s. Rust-eaten assembly lines and ghost cars still mid-production on conveyor belts.',
   78, 'medium', '2024-09'),

  ('Théâtre Grand Siècle', 'mall', 48.8710, 2.3440,
   'Baroque theater shuttered after a structural failure. The velvet seats remain, facing a stage where no curtain has risen in 30 years.',
   62, 'low', '2025-01'),

  ('Centrale Électrique Est', 'industrial', 48.8490, 2.4020,
   'A massive coal power station with turbines the size of houses. The control room looks like a retro-futurist film set.',
   88, 'high', '2024-07'),

  ('Villa des Artistes', 'school', 48.8640, 2.3010,
   'An art deco mansion abandoned mid-renovation. Canvases still on easels, a grand piano in the salon, and a half-finished mural on the staircase wall.',
   54, 'low', '2025-02'),

  ('Gare Fantôme du Nord', 'tunnel', 48.8800, 2.3600,
   'A forgotten underground station sealed in 1939. Wartime graffiti, original wooden benches, and timetables for trains that never came back.',
   83, 'medium', '2024-12'),

  ('Caserne Militaire Désaffectée', 'industrial', 48.8320, 2.3880,
   'A sprawling garrison abandoned after the Cold War. Empty barracks, a rusted armory, and a parade ground slowly being consumed by weeds.',
   94, 'high', '2024-06'),

  ('Lycée de la République', 'school', 48.8550, 2.3350,
   'A grand school building closed in the 1970s. Chalkboards still bear half-erased equations. Student desks remain in perfect rows, gathering dust.',
   58, 'low', '2025-03'),

  ('Abbaye Saint-Gilles', 'mall', 48.8760, 2.3100,
   'A medieval abbey crumbling since the Revolution. Stained glass shards litter the nave floor. The crypt below remains untouched and sealed.',
   75, 'medium', '2024-10'),

  ('Hôtel Particulier Fantôme', 'mall', 48.8600, 2.3680,
   'A 19th-century private mansion frozen in time. Rotting drapes, a dining table still set for guests, and a library of moldering first editions.',
   49, 'low', '2025-01');
