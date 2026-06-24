-- Harden the `supporters` table: entitlements must only ever be written by the
-- service role (the verified Dodo webhook / billing edge functions), never by
-- the end user from the browser.
--
-- Previously, "Users can insert own supporter record" and
-- "Users can update own supporter record" allowed any authenticated user to
-- insert/update their own row with status = 'active', granting free premium
-- access. We drop those policies. The SELECT policy stays so users can still
-- read their own subscription status. The service role bypasses RLS, so the
-- webhook and cancel-subscription functions continue to work unchanged.

DROP POLICY IF EXISTS "Users can insert own supporter record" ON supporters;
DROP POLICY IF EXISTS "Users can update own supporter record" ON supporters;

-- Keep (idempotently ensure) the read-only policy for users.
DROP POLICY IF EXISTS "Users can view own supporter status" ON supporters;
CREATE POLICY "Users can view own supporter status"
  ON supporters FOR SELECT
  USING (auth.uid() = user_id);
