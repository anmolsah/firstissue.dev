-- Create contributions table for tracking GitHub activity
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE SET NULL,
  
  -- GitHub Data
  github_issue_number INTEGER,
  github_repo_owner TEXT NOT NULL,
  github_repo_name TEXT NOT NULL,
  issue_url TEXT NOT NULL,
  issue_title TEXT NOT NULL,
  issue_state TEXT, -- 'open', 'closed'
  
  -- PR Data
  pr_url TEXT,
  pr_number INTEGER,
  pr_status TEXT, -- 'open', 'merged', 'closed', 'draft'
  pr_title TEXT,
  pr_created_at TIMESTAMP WITH TIME ZONE,
  pr_merged_at TIMESTAMP WITH TIME ZONE,
  pr_closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Activity Tracking
  is_assigned BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE,
  has_commented BOOLEAN DEFAULT false,
  first_comment_at TIMESTAMP WITH TIME ZONE,
  comment_count INTEGER DEFAULT 0,
  
  -- Metadata
  language TEXT,
  labels TEXT[],
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT contributions_user_issue_unique UNIQUE(user_id, github_repo_owner, github_repo_name, github_issue_number)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_pr_status ON public.contributions(pr_status);
CREATE INDEX IF NOT EXISTS idx_contributions_last_synced ON public.contributions(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON public.contributions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own contributions
CREATE POLICY "Users can view own contributions"
  ON public.contributions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own contributions
CREATE POLICY "Users can insert own contributions"
  ON public.contributions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own contributions
CREATE POLICY "Users can update own contributions"
  ON public.contributions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own contributions
CREATE POLICY "Users can delete own contributions"
  ON public.contributions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contributions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contributions_timestamp
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_contributions_updated_at();

-- Add comment to table
COMMENT ON TABLE public.contributions IS 'Tracks user GitHub contributions including issues, PRs, and activity';
