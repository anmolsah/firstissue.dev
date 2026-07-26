-- Daily message quota for the FirstMate AI Copilot.
--
-- Free accounts get a fixed number of messages per UTC day; supporters are
-- unlimited. The `kb-query` edge function is the only writer (service role) —
-- clients may read their own row to render "N left today", but must never be
-- able to reset or inflate it.

CREATE TABLE IF NOT EXISTS public.ai_copilot_usage (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_date date NOT NULL DEFAULT (timezone('utc'::text, now()))::date,
    message_count integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.ai_copilot_usage ENABLE ROW LEVEL SECURITY;

-- Read-only for the owner; there are deliberately no INSERT/UPDATE/DELETE
-- policies, so only the service role can write counts.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'ai_copilot_usage' AND policyname = 'Users can select own copilot usage'
    ) THEN
        CREATE POLICY "Users can select own copilot usage" ON public.ai_copilot_usage
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Atomically consume one message from today's quota.
--
-- Returns allowed=false without incrementing when the limit is already spent.
-- The row lock makes concurrent requests (double-clicks, multiple tabs) safe.
CREATE OR REPLACE FUNCTION public.consume_ai_copilot_quota(
    p_user_id uuid,
    p_limit integer
)
RETURNS TABLE (allowed boolean, used integer, daily_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today date := (timezone('utc'::text, now()))::date;
    v_used integer;
BEGIN
    INSERT INTO public.ai_copilot_usage (user_id, usage_date, message_count)
    VALUES (p_user_id, v_today, 0)
    ON CONFLICT (user_id, usage_date) DO NOTHING;

    SELECT message_count INTO v_used
    FROM public.ai_copilot_usage
    WHERE user_id = p_user_id AND usage_date = v_today
    FOR UPDATE;

    IF v_used >= p_limit THEN
        RETURN QUERY SELECT false, v_used, p_limit;
        RETURN;
    END IF;

    UPDATE public.ai_copilot_usage
    SET message_count = message_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id AND usage_date = v_today
    RETURNING message_count INTO v_used;

    RETURN QUERY SELECT true, v_used, p_limit;
END;
$$;

-- The limit is an argument, so this must never be callable by end users —
-- only the edge function (service role) decides what the limit is.
REVOKE ALL ON FUNCTION public.consume_ai_copilot_quota(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_ai_copilot_quota(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.consume_ai_copilot_quota(uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_copilot_quota(uuid, integer) TO service_role;
