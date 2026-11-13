-- ============================================================
-- Repository Health Metrics Cache Table
-- Tracks maintainer responsiveness, first-timer PR merge rate,
-- onboarding docs presence, and overall beginner-friendliness.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.repo_health (
  repo_full_name           TEXT PRIMARY KEY,
  stars                    INTEGER NOT NULL DEFAULT 0,
  open_issues_count        INTEGER NOT NULL DEFAULT 0,
  is_archived              BOOLEAN NOT NULL DEFAULT false,
  has_contributing         BOOLEAN NOT NULL DEFAULT false,
  has_code_of_conduct      BOOLEAN NOT NULL DEFAULT false,
  last_pushed_at           TIMESTAMPTZ,
  median_pr_merge_hours    REAL,
  median_issue_reply_hours REAL,
  first_timer_merge_rate   REAL,
  merged_prs_30d           INTEGER NOT NULL DEFAULT 0,
  good_first_issue_count   INTEGER NOT NULL DEFAULT 0,
  health_score             INTEGER NOT NULL DEFAULT 50,
  health_tier              TEXT NOT NULL DEFAULT 'moderate',
  health_summary           TEXT,
  synced_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repo_health_score
  ON public.repo_health (health_score DESC);

CREATE INDEX IF NOT EXISTS idx_repo_health_synced_at
  ON public.repo_health (synced_at DESC);

CREATE INDEX IF NOT EXISTS idx_repo_health_stars
  ON public.repo_health (stars DESC);

ALTER TABLE public.repo_health ENABLE ROW LEVEL SECURITY;

-- Public read access for Explore & Smart Match UI
CREATE POLICY "Public read repo_health"
  ON public.repo_health
  FOR SELECT
  TO anon, authenticated
  USING (true);

