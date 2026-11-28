-- Migration: Add optional LinkedIn & X (Twitter) links to profiles and create user_projects table
-- Powers social links in Profile Overview + Public Profile, and Live Projects showcase.

-- 1. Optional social profile columns on public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

COMMENT ON COLUMN public.profiles.linkedin_url IS 'Optional LinkedIn profile URL displayed on overview and public profile.';
COMMENT ON COLUMN public.profiles.twitter_url IS 'Optional X (Twitter) profile URL displayed on overview and public profile.';

-- 2. Live Projects table for developer portfolio & public profile
CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 120),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 400),
  live_url TEXT NOT NULL CHECK (char_length(trim(live_url)) > 0 AND char_length(live_url) <= 500),
  repo_url TEXT CHECK (repo_url IS NULL OR char_length(repo_url) <= 500),
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_projects_user_id_created
  ON public.user_projects (user_id, created_at DESC);

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_projects'
      AND policyname = 'Public projects are viewable by everyone'
  ) THEN
    CREATE POLICY "Public projects are viewable by everyone"
      ON public.user_projects
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_projects'
      AND policyname = 'Users can insert own projects'
  ) THEN
    CREATE POLICY "Users can insert own projects"
      ON public.user_projects
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_projects'
      AND policyname = 'Users can update own projects'
  ) THEN
    CREATE POLICY "Users can update own projects"
      ON public.user_projects
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_projects'
      AND policyname = 'Users can delete own projects'
  ) THEN
    CREATE POLICY "Users can delete own projects"
      ON public.user_projects
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT ON public.user_projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_projects TO authenticated;
