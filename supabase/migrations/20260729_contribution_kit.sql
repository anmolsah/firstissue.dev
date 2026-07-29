-- Contribution Kit: the one-click "how do I actually start this PR?" helper.
--
-- Free accounts may generate a fixed number of kits per calendar month;
-- supporters are unlimited. The pre-submit diff review is supporter-only and
-- is not metered here. As with the AI copilot quota, the `contribution-kit`
-- edge function (service role) is the only writer — clients may read their own
-- usage row to render "N left this month" but can never reset or inflate it.

-- ── Monthly usage counter ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contribution_kit_usage (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- First day of the UTC month this count belongs to.
    usage_month date NOT NULL DEFAULT date_trunc('month', timezone('utc'::text, now()))::date,
    kit_count integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, usage_month)
);

ALTER TABLE public.contribution_kit_usage ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'contribution_kit_usage' AND policyname = 'Users can select own kit usage'
    ) THEN
        CREATE POLICY "Users can select own kit usage" ON public.contribution_kit_usage
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ── Generated-kit cache ───────────────────────────────────────────
-- Re-opening a kit the user already generated must be instant and must NOT
-- consume another monthly credit, so we persist the generated payload keyed by
-- (user, repo, issue). The edge function checks this before metering.
CREATE TABLE IF NOT EXISTS public.contribution_kits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo text NOT NULL,               -- "owner/name"
    issue_number integer NOT NULL,
    issue_url text NOT NULL,
    issue_title text,
    kit jsonb NOT NULL,               -- structured kit payload
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, repo, issue_number)
);

CREATE INDEX IF NOT EXISTS idx_contribution_kits_user_created
    ON public.contribution_kits (user_id, created_at DESC);

ALTER TABLE public.contribution_kits ENABLE ROW LEVEL SECURITY;

-- Owner may read their own kits; only the service role writes them.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'contribution_kits' AND policyname = 'Users can select own kits'
    ) THEN
        CREATE POLICY "Users can select own kits" ON public.contribution_kits
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ── Atomic monthly quota consumption ──────────────────────────────
-- Returns allowed=false without incrementing when the month's allowance is
-- already spent. The row lock keeps concurrent requests safe.
CREATE OR REPLACE FUNCTION public.consume_kit_quota(
    p_user_id uuid,
    p_limit integer
)
RETURNS TABLE (allowed boolean, used integer, monthly_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month date := date_trunc('month', timezone('utc'::text, now()))::date;
    v_used integer;
BEGIN
    INSERT INTO public.contribution_kit_usage (user_id, usage_month, kit_count)
    VALUES (p_user_id, v_month, 0)
    ON CONFLICT (user_id, usage_month) DO NOTHING;

    SELECT kit_count INTO v_used
    FROM public.contribution_kit_usage
    WHERE user_id = p_user_id AND usage_month = v_month
    FOR UPDATE;

    IF v_used >= p_limit THEN
        RETURN QUERY SELECT false, v_used, p_limit;
        RETURN;
    END IF;

    UPDATE public.contribution_kit_usage
    SET kit_count = kit_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id AND usage_month = v_month
    RETURNING kit_count INTO v_used;

    RETURN QUERY SELECT true, v_used, p_limit;
END;
$$;

-- The limit is an argument, so end users must never call this directly —
-- only the edge function (service role) decides the limit.
REVOKE ALL ON FUNCTION public.consume_kit_quota(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_kit_quota(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.consume_kit_quota(uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_kit_quota(uuid, integer) TO service_role;

-- ── Refund one credit ─────────────────────────────────────────────
-- Called by the edge function when generation was metered but then failed
-- (e.g. the AI provider errored), so a free user never loses their credit for
-- a kit they never received. Never drops below zero.
CREATE OR REPLACE FUNCTION public.refund_kit_quota(
    p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month date := date_trunc('month', timezone('utc'::text, now()))::date;
BEGIN
    UPDATE public.contribution_kit_usage
    SET kit_count = GREATEST(kit_count - 1, 0),
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id AND usage_month = v_month;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_kit_quota(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_kit_quota(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.refund_kit_quota(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refund_kit_quota(uuid) TO service_role;
