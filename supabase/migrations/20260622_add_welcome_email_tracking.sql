-- Add welcome_email_sent_at to profiles for idempotency tracking
-- Prevents duplicate welcome emails on webhook retries

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.welcome_email_sent_at IS
  'Timestamp when the welcome email was sent via Resend. NULL = not yet sent.';
