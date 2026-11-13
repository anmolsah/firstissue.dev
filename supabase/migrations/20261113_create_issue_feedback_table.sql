-- ============================================================
-- Issue Feedback Table — User Dismissals & Personalization Signals
-- Stores per-user dismissals ("Not for me") and explicit feedback
-- so Explore and Smart Match adapt to contributor preferences.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.issue_feedback (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_url   TEXT NOT NULL,
  repo        TEXT,
  language    TEXT,
  task_type   TEXT,
  labels      TEXT[] NOT NULL DEFAULT '{}',
  feedback    TEXT NOT NULL CHECK (feedback IN ('dismissed', 'bookmarked', 'clicked', 'merged')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT issue_feedback_user_url_action_unique UNIQUE (user_id, issue_url, feedback)
);

CREATE INDEX IF NOT EXISTS idx_issue_feedback_user_created
  ON public.issue_feedback (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_issue_feedback_user_type
  ON public.issue_feedback (user_id, feedback);

ALTER TABLE public.issue_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own issue feedback"
  ON public.issue_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issue feedback"
  ON public.issue_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own issue feedback"
  ON public.issue_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

