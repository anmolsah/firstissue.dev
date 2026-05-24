-- Add tech_stack array column to profiles table
-- This stores the user's self-declared tech stack for SmartMatch

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';

-- Add a comment for documentation
COMMENT ON COLUMN public.profiles.tech_stack IS 'User-declared tech stack (e.g., React, Node.js, Python) used for SmartMatch issue recommendations';
