-- ============================================================
-- Issue Click Events — First-party analytics table
-- Logs every outbound GitHub issue click from the frontend
-- so you can query click patterns, popular repos, and
-- feature surface effectiveness independently of Umami.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.issue_click_events (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  issue_url   TEXT        NOT NULL,
  source      TEXT        NOT NULL,  -- 'explore' | 'smart_match' | 'bookmarks' | 'status'
  repo        TEXT,                   -- 'owner/repo' extracted from the URL
  action      TEXT,                   -- 'title_click' | 'view_issue' | 'external_link' | 'repo_link'
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for time-range queries (dashboards, daily aggregations)
CREATE INDEX IF NOT EXISTS idx_issue_click_events_created_at
  ON public.issue_click_events (created_at DESC);

-- Index for filtering by source feature
CREATE INDEX IF NOT EXISTS idx_issue_click_events_source
  ON public.issue_click_events (source);

-- Index for popular-repo queries
CREATE INDEX IF NOT EXISTS idx_issue_click_events_repo
  ON public.issue_click_events (repo);

-- ── Row Level Security ──────────────────────────────────────
-- Allow any visitor (anon or authenticated) to INSERT events.
-- Only service_role can SELECT/UPDATE/DELETE (for admin dashboards).

ALTER TABLE public.issue_click_events ENABLE ROW LEVEL SECURITY;

-- Anyone can log a click (anon role insert)
CREATE POLICY "Anyone can insert click events"
  ON public.issue_click_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read their own click events (optional self-analytics)
CREATE POLICY "Users can read own click events"
  ON public.issue_click_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
