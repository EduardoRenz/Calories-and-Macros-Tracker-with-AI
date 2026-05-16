create or replace function public.downgrade_expired_access()
returns void
language plpgsql
security definer
as $$
begin
  update public.billing_subscriptions
  set
    access_status = 'free',
    status = (case 
      when cancel_at_period_end then 'canceled'
      else 'unpaid'
    end)::subscription_status,
    ended_at = coalesce(current_period_end, now()),
    updated_at = now()
  where
    current_period_end <= now()
    and access_status = 'premium';
end;
$$;

create extension if not exists pg_cron with schema extensions;
select cron.schedule(
  'downgrade-expired-access',
  '0 */6 * * *',
  $$ select public.downgrade_expired_access(); $$
);