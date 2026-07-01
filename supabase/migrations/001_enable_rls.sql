-- HireMe AI: Enable Row Level Security on all public tables
-- Run once in Supabase Dashboard → SQL Editor
-- Project: hireme-ai (cmbietqziqpmmnxsjjuv)
--
-- Effect: blocks anon/authenticated direct API access (no policies = deny all)
-- service_role (used by Next.js API + GitHub Actions) bypasses RLS — no app changes needed

-- Core app tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.creem_events ENABLE ROW LEVEL SECURITY;

-- Marketing tables
ALTER TABLE IF EXISTS public.marketing_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_publish_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.marketing_anxiety_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Legacy tables (if they still exist from early MVP)
ALTER TABLE IF EXISTS public.anonymous_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monthly_cost ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cost_logs ENABLE ROW LEVEL SECURITY;

-- View: respect underlying table RLS (PostgreSQL 15+)
ALTER VIEW IF EXISTS public.marketing_monthly_tokens SET (security_invoker = true);
