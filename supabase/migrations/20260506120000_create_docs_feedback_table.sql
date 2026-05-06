-- Create docs_feedback table
CREATE TABLE IF NOT EXISTS public.docs_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id text NOT NULL,
    vote_type text CHECK (vote_type IN ('up', 'down')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.docs_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous voting)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'docs_feedback' AND policyname = 'Allow anonymous inserts'
    ) THEN
        CREATE POLICY "Allow anonymous inserts" ON public.docs_feedback
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Allow anyone to read (to show counts)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'docs_feedback' AND policyname = 'Allow anonymous select'
    ) THEN
        CREATE POLICY "Allow anonymous select" ON public.docs_feedback
            FOR SELECT USING (true);
    END IF;
END $$;
