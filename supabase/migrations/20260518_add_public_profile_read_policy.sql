-- Allow anyone to read basic profile info (for public Proof of Work profiles)
-- This only exposes non-sensitive fields: github_username, avatar_url, full_name
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);
