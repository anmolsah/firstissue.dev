-- Add quantified impact columns to user_attestations table
ALTER TABLE public.user_attestations
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS impact_summary TEXT,
ADD COLUMN IF NOT EXISTS problem_solved TEXT,
ADD COLUMN IF NOT EXISTS technical_highlights JSONB,
ADD COLUMN IF NOT EXISTS tech_stack JSONB,
ADD COLUMN IF NOT EXISTS repo_stars INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS additions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deletions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS changed_files INTEGER DEFAULT 0;

-- Refresh the postgrest schema cache
NOTIFY pgrst, 'reload schema';
