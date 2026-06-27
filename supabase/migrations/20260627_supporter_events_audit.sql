-- Audit log for everything that changes a supporter's billing state.
--
-- Why this exists: when a supporter row flips to "cancelled"/"expired", the
-- only previous record of *why* was the edge-function console logs, which roll
-- off quickly. That made incidents like "my subscription cancelled itself and
-- the cancel function logs are empty" impossible to diagnose after the fact.
--
-- Every meaningful lifecycle event — activation, renewal, cancellation, expiry,
-- on_hold, failed, payment failure, and the user-initiated cancel API call — is
-- now recorded here by the service role (dodo-webhook / cancel-subscription).
-- To investigate a row, query supporter_events for that user_id ordered by
-- created_at and read off the exact event_type + dodo_status + cancel_reason.

CREATE TABLE IF NOT EXISTS supporter_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  event_type TEXT,          -- e.g. subscription.cancelled, subscription.expired, payment.failed
  dodo_status TEXT,         -- the subscription/payment status carried in the payload
  cancel_reason TEXT,       -- Dodo cancel_reason / cancellation context when present
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supporter_events_user_id ON supporter_events(user_id);
CREATE INDEX IF NOT EXISTS idx_supporter_events_subscription ON supporter_events(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_supporter_events_created_at ON supporter_events(created_at DESC);

-- RLS: this is an internal audit log. The service role (used by the edge
-- functions) bypasses RLS, so writes work. We enable RLS with a read-only
-- policy so a user can inspect their own billing history but cannot tamper
-- with the audit trail. (No INSERT/UPDATE/DELETE policies on purpose.)
ALTER TABLE supporter_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own supporter events" ON supporter_events;
CREATE POLICY "Users can view own supporter events"
  ON supporter_events FOR SELECT
  USING (auth.uid() = user_id);
