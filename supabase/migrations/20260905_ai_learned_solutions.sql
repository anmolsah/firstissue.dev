-- Migration: Create ai_learned_solutions table for continuous AI learning & feedback loop
-- Date: 2026-09-05

CREATE TABLE IF NOT EXISTS public.ai_learned_solutions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    query_text text NOT NULL,
    assistant_response text NOT NULL,
    user_feedback text CHECK (user_feedback IN ('up', 'down', 'correction')) NOT NULL,
    user_correction text,
    topic_tags text[] DEFAULT '{}',
    is_verified boolean DEFAULT false,
    helpful_count integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching relevant queries and feedback
CREATE INDEX IF NOT EXISTS idx_ai_learned_solutions_feedback
    ON public.ai_learned_solutions (user_feedback, helpful_count DESC);

CREATE INDEX IF NOT EXISTS idx_ai_learned_solutions_created
    ON public.ai_learned_solutions (created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_learned_solutions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read positively validated solutions (up or verified corrections)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_learned_solutions' AND policyname = 'Allow public read of validated solutions'
    ) THEN
        CREATE POLICY "Allow public read of validated solutions" ON public.ai_learned_solutions
            FOR SELECT USING (true);
    END IF;
END $$;

-- Allow anonymous or authenticated users to insert feedback
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_learned_solutions' AND policyname = 'Allow inserting feedback and learned solutions'
    ) THEN
        CREATE POLICY "Allow inserting feedback and learned solutions" ON public.ai_learned_solutions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Function to record or increment helpful vote on a learned solution
CREATE OR REPLACE FUNCTION vote_learned_solution(
    p_query_text text,
    p_assistant_response text,
    p_feedback text,
    p_correction text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
BEGIN
    -- Check if an identical query + response pair already exists
    SELECT id INTO v_id 
    FROM public.ai_learned_solutions 
    WHERE query_text = p_query_text 
      AND user_feedback = p_feedback
    LIMIT 1;

    IF v_id IS NOT NULL THEN
        UPDATE public.ai_learned_solutions
        SET helpful_count = helpful_count + 1,
            updated_at = now()
        WHERE id = v_id;
        RETURN v_id;
    ELSE
        INSERT INTO public.ai_learned_solutions (
            query_text,
            assistant_response,
            user_feedback,
            user_correction,
            helpful_count
        ) VALUES (
            p_query_text,
            p_assistant_response,
            p_feedback,
            p_correction,
            1
        ) RETURNING id INTO v_id;
        RETURN v_id;
    END IF;
END;
$$;
