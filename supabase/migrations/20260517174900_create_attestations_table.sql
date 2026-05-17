-- Create user_attestations table for Proof of Work feature
CREATE TABLE IF NOT EXISTS public.user_attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    repo_name TEXT NOT NULL,
    pr_number INTEGER NOT NULL,
    pr_title TEXT NOT NULL,
    impact_score INTEGER NOT NULL DEFAULT 0,
    primary_language TEXT,
    merged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    attestation_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure a user can only attest a specific PR once
    UNIQUE(user_id, repo_name, pr_number)
);

-- Add RLS policies
ALTER TABLE public.user_attestations ENABLE ROW LEVEL SECURITY;

-- Anyone can view attestations (since they are public proofs)
CREATE POLICY "Attestations are viewable by everyone" 
ON public.user_attestations 
FOR SELECT 
USING (true);

-- Only the service role (edge function) can insert/update attestations
CREATE POLICY "Only service role can insert attestations" 
ON public.user_attestations 
FOR INSERT 
WITH CHECK (false); -- Block direct client inserts, must use service_role key

CREATE POLICY "Only service role can update attestations" 
ON public.user_attestations 
FOR UPDATE 
USING (false);

CREATE POLICY "Only service role can delete attestations" 
ON public.user_attestations 
FOR DELETE 
USING (false);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_attestations;
