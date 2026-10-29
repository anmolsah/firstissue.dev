-- Add college column to profiles table
-- Stores user's college or university name for their developer profile

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS college TEXT;

COMMENT ON COLUMN public.profiles.college IS 'User college or university name';
