-- Dedicated billing and subscription schema.
--
-- This file supersedes the early billing draft in supabase/sqls.sql for the
-- AbacatePay recurring billing integration. Keep this script isolated so the
-- billing lifecycle can evolve without changing the broader application schema.
--
-- Migration expectation:
-- - New code should read and write the public.billing_* tables below.
-- - The legacy public.plans, public.customers, public.subscriptions, and
--   public.transactions tables in supabase/sqls.sql are left untouched for
--   coexistence during implementation tasks and should be migrated separately.
-- - Provider-originated writes are server-controlled through service-role
--   clients and Supabase Edge Functions. Authenticated clients receive only
--   narrowly scoped read access to their own billing records.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_provider') then
    create type public.payment_provider as enum ('stripe', 'abacatepay', 'pagarme', 'manual', 'internal');
  end if;
end $$;

alter type public.payment_provider add value if not exists 'stripe';
alter type public.payment_provider add value if not exists 'abacatepay';
alter type public.payment_provider add value if not exists 'pagarme';
alter type public.payment_provider add value if not exists 'manual';
alter type public.payment_provider add value if not exists 'internal';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'billing_interval') then
    create type public.billing_interval as enum ('month', 'year');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum ('pending', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_access_status') then
    create type public.billing_access_status as enum ('free', 'premium', 'grace_locked');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_transaction_type') then
    create type public.billing_transaction_type as enum ('charge', 'renewal', 'refund', 'dispute', 'loss');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_transaction_status') then
    create type public.billing_transaction_status as enum ('paid', 'failed', 'refunded', 'disputed', 'lost');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_inbound_event_state') then
    create type public.billing_inbound_event_state as enum ('received', 'processing', 'processed', 'rejected', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_checkout_session_status') then
    create type public.billing_checkout_session_status as enum ('created', 'pending', 'completed', 'expired', 'cancelled', 'failed');
  end if;
end $$;

alter type public.subscription_status add value if not exists 'pending';
alter type public.subscription_status add value if not exists 'trialing';
alter type public.subscription_status add value if not exists 'active';
alter type public.subscription_status add value if not exists 'past_due';
alter type public.subscription_status add value if not exists 'canceled';
alter type public.subscription_status add value if not exists 'unpaid';
alter type public.subscription_status add value if not exists 'inactive';

create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null unique,
  display_order integer not null default 0,
  billing_interval public.billing_interval not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_plan_provider_mappings (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.billing_plans(id) on delete cascade,
  provider public.payment_provider not null,
  provider_product_id text not null,
  provider_product_external_id text,
  provider_price_amount integer not null check (provider_price_amount >= 0),
  currency text not null default 'BRL',
  provider_cycle text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, provider)
);

create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider public.payment_provider not null,
  provider_customer_id text not null,
  email text not null,
  tax_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider),
  unique (provider, provider_customer_id)
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id) on delete restrict,
  provider public.payment_provider not null,
  provider_subscription_id text,
  provider_checkout_id text,
  status public.subscription_status not null,
  access_status public.billing_access_status not null default 'free',
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create table if not exists public.billing_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.billing_subscriptions(id) on delete set null,
  provider public.payment_provider not null,
  provider_transaction_id text not null,
  provider_checkout_id text,
  transaction_type public.billing_transaction_type not null,
  status public.billing_transaction_status not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  occurred_at timestamptz not null,
  receipt_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);

create table if not exists public.billing_inbound_events (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null,
  provider_event_id text not null,
  event_type text not null,
  signature text,
  payload jsonb not null,
  processing_state public.billing_inbound_event_state not null default 'received',
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create table if not exists public.billing_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id) on delete restrict,
  provider public.payment_provider not null,
  provider_checkout_id text not null,
  checkout_url text not null,
  status public.billing_checkout_session_status not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_checkout_id)
);

create unique index if not exists idx_billing_subscriptions_provider_subscription_id
  on public.billing_subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create index if not exists idx_billing_plan_provider_mappings_plan_provider
  on public.billing_plan_provider_mappings (plan_id, provider);

create index if not exists idx_billing_customers_user_provider
  on public.billing_customers (user_id, provider);

create index if not exists idx_billing_subscriptions_user_status
  on public.billing_subscriptions (user_id, status);

create index if not exists idx_billing_subscriptions_checkout
  on public.billing_subscriptions (provider, provider_checkout_id)
  where provider_checkout_id is not null;

create index if not exists idx_billing_transactions_user_occurred_at
  on public.billing_transactions (user_id, occurred_at desc);

create index if not exists idx_billing_inbound_events_processing_state
  on public.billing_inbound_events (processing_state, received_at);

create or replace function public.set_billing_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_billing_plans_updated_at on public.billing_plans;
create trigger set_billing_plans_updated_at
before update on public.billing_plans
for each row execute procedure public.set_billing_updated_at();

drop trigger if exists set_billing_plan_provider_mappings_updated_at on public.billing_plan_provider_mappings;
create trigger set_billing_plan_provider_mappings_updated_at
before update on public.billing_plan_provider_mappings
for each row execute procedure public.set_billing_updated_at();

drop trigger if exists set_billing_customers_updated_at on public.billing_customers;
create trigger set_billing_customers_updated_at
before update on public.billing_customers
for each row execute procedure public.set_billing_updated_at();

drop trigger if exists set_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger set_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute procedure public.set_billing_updated_at();

drop trigger if exists set_billing_checkout_sessions_updated_at on public.billing_checkout_sessions;
create trigger set_billing_checkout_sessions_updated_at
before update on public.billing_checkout_sessions
for each row execute procedure public.set_billing_updated_at();

alter table public.billing_plans enable row level security;
alter table public.billing_plan_provider_mappings enable row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_transactions enable row level security;
alter table public.billing_inbound_events enable row level security;
alter table public.billing_checkout_sessions enable row level security;

drop policy if exists "billing_plans_read_active" on public.billing_plans;
create policy "billing_plans_read_active" on public.billing_plans
  for select using (active = true);

drop policy if exists "billing_plan_provider_mappings_read_active_plan" on public.billing_plan_provider_mappings;
create policy "billing_plan_provider_mappings_read_active_plan" on public.billing_plan_provider_mappings
  for select using (
    exists (
      select 1
      from public.billing_plans
      where billing_plans.id = billing_plan_provider_mappings.plan_id
        and billing_plans.active = true
    )
  );

drop policy if exists "billing_customers_read_own" on public.billing_customers;
create policy "billing_customers_read_own" on public.billing_customers
  for select using (auth.uid() = user_id);

drop policy if exists "billing_subscriptions_read_own" on public.billing_subscriptions;
create policy "billing_subscriptions_read_own" on public.billing_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "billing_transactions_read_own" on public.billing_transactions;
create policy "billing_transactions_read_own" on public.billing_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "billing_checkout_sessions_read_own" on public.billing_checkout_sessions;
create policy "billing_checkout_sessions_read_own" on public.billing_checkout_sessions
  for select using (auth.uid() = user_id);

revoke all on public.billing_plans from anon, authenticated;
revoke all on public.billing_plan_provider_mappings from anon, authenticated;
revoke all on public.billing_customers from anon, authenticated;
revoke all on public.billing_subscriptions from anon, authenticated;
revoke all on public.billing_transactions from anon, authenticated;
revoke all on public.billing_inbound_events from anon, authenticated;
revoke all on public.billing_checkout_sessions from anon, authenticated;

grant select on public.billing_plans to anon, authenticated;
grant select on public.billing_plan_provider_mappings to anon, authenticated;
grant select on public.billing_customers to authenticated;
grant select on public.billing_subscriptions to authenticated;
grant select on public.billing_transactions to authenticated;
grant select on public.billing_checkout_sessions to authenticated;

grant all on public.billing_plans to service_role;
grant all on public.billing_plan_provider_mappings to service_role;
grant all on public.billing_customers to service_role;
grant all on public.billing_subscriptions to service_role;
grant all on public.billing_transactions to service_role;
grant all on public.billing_inbound_events to service_role;
grant all on public.billing_checkout_sessions to service_role;
