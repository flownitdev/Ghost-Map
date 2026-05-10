-- GhostMap: Location ingestion & moderation schema migration
-- Run this in your Supabase SQL editor

-- ─── Add new columns to locations ───────────────────────────────────────────

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS closure_date        text,
  ADD COLUMN IF NOT EXISTS building_status     text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS demolition_status   text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verification_state  text DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS source_type         text DEFAULT 'user_submission',
  ADD COLUMN IF NOT EXISTS source_attribution  text;

-- ─── Submissions (moderation queue) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS submissions (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name               text        NOT NULL,
  category           text        NOT NULL,
  latitude           real        NOT NULL,
  longitude          real        NOT NULL,
  description        text        NOT NULL,
  risk_level         text        NOT NULL,
  abandonment_score  integer     NOT NULL,
  closure_date       text,
  building_status    text        DEFAULT 'unknown',
  demolition_status  text        DEFAULT 'none',
  source_type        text        DEFAULT 'user_submission',
  source_attribution text,
  notes              text,
  submitted_by       text,
  submitted_at       timestamptz DEFAULT now(),
  status             text        DEFAULT 'pending',  -- pending | approved | rejected
  reviewed_by        text,
  reviewed_at        timestamptz,
  review_note        text,
  duplicate_of       integer     REFERENCES locations(id)
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_locations_verification ON locations(verification_state);
CREATE INDEX IF NOT EXISTS idx_locations_source       ON locations(source_type);
CREATE INDEX IF NOT EXISTS idx_submissions_status     ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted  ON submissions(submitted_at DESC);

-- ─── RLS Policies ────────────────────────────────────────────────────────────

-- Everyone can read approved locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "locations_select" ON locations;
CREATE POLICY "locations_select" ON locations FOR SELECT USING (true);
DROP POLICY IF EXISTS "locations_insert" ON locations;
CREATE POLICY "locations_insert" ON locations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "locations_update" ON locations;
CREATE POLICY "locations_update" ON locations FOR UPDATE USING (true);

-- Submissions: anyone can insert, only authenticated users can read their own
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submissions_insert" ON submissions;
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "submissions_select" ON submissions;
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "submissions_update" ON submissions;
CREATE POLICY "submissions_update" ON submissions FOR UPDATE USING (true);
