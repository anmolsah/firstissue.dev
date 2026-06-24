-- Create supporters table for managing premium subscriptions
-- Run this in Supabase SQL editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS supporters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  plan TEXT DEFAULT 'supporter',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  amount_cents INTEGER DEFAULT 900,
  currency TEXT DEFAULT 'USD',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own supporter status
CREATE POLICY "Users can view own supporter status"
  ON supporters FOR SELECT
  USING (auth.uid() = user_id);

-- IMPORTANT: Users must NOT be able to INSERT or UPDATE their own supporter
-- record from the client — that would let anyone grant themselves premium by
-- writing status = 'active'. Entitlements are written exclusively by the
-- service role inside the verified Dodo webhook / billing edge functions, which
-- bypass RLS. (No user-facing INSERT/UPDATE policies on purpose.)

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_supporters_user_id ON supporters(user_id);
CREATE INDEX IF NOT EXISTS idx_supporters_status ON supporters(status);
