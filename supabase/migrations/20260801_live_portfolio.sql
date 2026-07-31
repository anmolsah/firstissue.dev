-- Live Portfolio: turn Proof of Work into a subscription-backed, accruing profile.
--
-- Adds two capabilities to profiles:
--   1. "Open to work" — a free, recruiter-facing flag + short blurb shown on the
--      public /u/<username> page.
--   2. badge_stats snapshot — supports the paid, embeddable SVG badge. Active
--      supporters get a LIVE badge (recomputed + snapshot refreshed on each
--      render by the badge-svg edge function); when a subscription lapses the
--      badge "freezes" to this last snapshot. The public page and all minted
--      credentials remain live regardless.
--
-- RLS: profiles already has a public SELECT policy (20260518) and an owner
-- UPDATE policy (used today for tech_stack). open_to_work* are owner-writable
-- through that same policy; badge_stats* are written only by the service role
-- inside the badge-svg function.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS open_to_work        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_to_work_blurb  TEXT,
  ADD COLUMN IF NOT EXISTS badge_stats         JSONB,
  ADD COLUMN IF NOT EXISTS badge_stats_frozen_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.open_to_work IS 'Recruiter-facing "open to opportunities" flag shown on the public profile.';
COMMENT ON COLUMN public.profiles.open_to_work_blurb IS 'Short one-line pitch shown when open_to_work is true (e.g. "Frontend dev seeking remote React roles").';
COMMENT ON COLUMN public.profiles.badge_stats IS 'Last-rendered snapshot of Proof of Work stats for the embeddable SVG badge. Refreshed live for active supporters; frozen otherwise.';
COMMENT ON COLUMN public.profiles.badge_stats_frozen_at IS 'When badge_stats was last written by the badge-svg function.';
