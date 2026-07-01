-- Migration: Add stars_synced_at column to startup_orgs
-- This tracks when the star count was last fetched from GitHub
-- so we can identify stale records and avoid unnecessary updates.

ALTER TABLE startup_orgs
  ADD COLUMN IF NOT EXISTS stars_synced_at TIMESTAMPTZ;

-- Index for efficiently finding orgs that need a star refresh
-- (e.g. WHERE stars_synced_at IS NULL OR stars_synced_at < now() - interval '1 day')
CREATE INDEX IF NOT EXISTS idx_startup_orgs_stars_synced_at
  ON startup_orgs (stars_synced_at);
