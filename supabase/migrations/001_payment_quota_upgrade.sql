-- HireMe AI: lifetime free quota + credits + payment idempotency
-- Run in Supabase SQL Editor before deploying code changes.

ALTER TABLE anonymous_devices
  ADD COLUMN IF NOT EXISTS total_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_uses INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creem_checkout_id TEXT UNIQUE NOT NULL,
  device_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('single', 'credits_pack')),
  amount_usd NUMERIC,
  credits_added INTEGER NOT NULL DEFAULT 0,
  uses_added INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_device_id
  ON payment_transactions (device_id);

-- Backfill total_used from historical daily_usage (optional, run once)
-- UPDATE anonymous_devices ad
-- SET total_used = COALESCE(
--   (SELECT SUM(call_count) FROM daily_usage du WHERE du.device_id = ad.device_id),
--   0
-- );
