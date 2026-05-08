-- Script to create a lifetime premium plan for admins
-- This plan is invisible to external users (active = false) and provides infinite premium access
--
-- Usage:
-- 1. Replace <ADMIN_USER_ID> with the actual UUID of the admin user
-- 2. Run this script in Supabase SQL Editor or via migration
--
-- Security notes:
-- - Plan is hidden from users (active = false)
-- - Only service_role can create subscriptions (RLS protected)
-- - NULL current_period_end means infinite access
-- - Requires service_role key to execute

DO $$
DECLARE
  v_plan_id uuid;
  v_user_id uuid := '<ADMIN_USER_ID>'; -- REPLACE WITH ACTUAL USER UUID
BEGIN
  -- 1. Create admin lifetime plan (invisible to external users)
  INSERT INTO public.billing_plans (plan_code, display_order, billing_interval, active)
  VALUES ('admin_lifetime', 0, 'month', false)
  ON CONFLICT (plan_code) DO NOTHING
  RETURNING id INTO v_plan_id;
  
  -- If plan already exists, get its ID
  IF v_plan_id IS NULL THEN
    SELECT id INTO v_plan_id FROM public.billing_plans WHERE plan_code = 'admin_lifetime';
  END IF;
  
  -- 2. Create subscription for the admin with infinite access
  INSERT INTO public.billing_subscriptions (
    user_id,
    plan_id,
    provider,
    status,
    access_status,
    current_period_end,
    current_period_start
  ) VALUES (
    v_user_id,
    v_plan_id,
    'internal',
    'active',
    'premium',
    NULL, -- NULL = infinite/lifetime access
    now()
  )
  ON CONFLICT (user_id, provider) DO UPDATE SET
    plan_id = v_plan_id,
    status = 'active',
    access_status = 'premium',
    current_period_end = NULL,
    updated_at = now();
  
  RAISE NOTICE 'Admin lifetime plan created successfully for user: %', v_user_id;
END $$;

-- Verification query (optional)
-- SELECT s.*, p.plan_code, p.active
-- FROM public.billing_subscriptions s
-- JOIN public.billing_plans p ON s.plan_id = p.id
-- WHERE s.user_id = '<ADMIN_USER_ID>';
