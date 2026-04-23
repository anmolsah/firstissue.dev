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

-- Policy: Users can insert their own supporter record (for post-payment fallback)
CREATE POLICY "Users can insert own supporter record"
  ON supporters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own supporter record
CREATE POLICY "Users can update own supporter record"
  ON supporters FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for webhook)
-- Note: Service role bypasses RLS by default, so no explicit policy needed

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_supporters_user_id ON supporters(user_id);
CREATE INDEX IF NOT EXISTS idx_supporters_status ON supporters(status);
