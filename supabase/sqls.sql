-- Create custom ENUM type for diet types
CREATE TYPE diet_type AS ENUM ('omnivore', 'vegetarian', 'vegan', 'pescatarian', 'carnivore', 'flexitarian');

-- 1) Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  age integer not null default 30,
  height integer not null default 170,
  weight numeric not null default 70,
  gender text not null default 'other',

  primary_goal text not null default 'maintain',
  target_weight numeric not null default 70,
  activity_level text not null default 'lightly',

  health_conditions text[] NOT NULL DEFAULT '{}',
  diet_type diet_type NOT NULL DEFAULT 'omnivore',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: Add a comment to the column
COMMENT ON COLUMN profiles.diet_type IS 'User dietary preference for personalized food recommendations';




-- 2) Weight history (equivalente ao weightHistory[] do profile)
create table if not exists public.weight_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- 3) Dashboard day (equivalente a users/{uid}/dashboard_data/{YYYY-MM-DD})
create table if not exists public.dashboard_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,

  calories_current integer not null default 0,
  calories_goal integer not null default 0,

  protein_current integer not null default 0,
  protein_goal integer not null default 0,

  carbs_current integer not null default 0,
  carbs_goal integer not null default 0,

  fats_current integer not null default 0,
  fats_goal integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, date)
);

-- 4) Dashboard ingredients (equivalente ao meals[mealType].ingredients[])
create table if not exists public.dashboard_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dashboard_day_id uuid not null references public.dashboard_days(id) on delete cascade,
  meal_type text not null, -- breakfast | lunch | dinner | snacks
  name text not null,
  quantity text not null default '1',
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fats integer not null default 0,
  fiber integer not null default 0,

  created_at timestamptz not null default now()
);

-- Índices recomendados
create index if not exists idx_dashboard_days_user_date on public.dashboard_days (user_id, date);
create index if not exists idx_dashboard_ingredients_day on public.dashboard_ingredients (dashboard_day_id);
create index if not exists idx_weight_history_user_date on public.weight_history (user_id, date);


-- 3.2) RLS (Row Level Security) + Policies

-- Ative RLS e crie policies para cada tabela.


-- Enable RLS
alter table public.profiles enable row level security;
alter table public.weight_history enable row level security;
alter table public.dashboard_days enable row level security;
alter table public.dashboard_ingredients enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weight history
create policy "weight_history_select_own" on public.weight_history
  for select using (auth.uid() = user_id);

create policy "weight_history_insert_own" on public.weight_history
  for insert with check (auth.uid() = user_id);

create policy "weight_history_update_own" on public.weight_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "weight_history_delete_own" on public.weight_history
  for delete using (auth.uid() = user_id);

-- Dashboard days
create policy "dashboard_days_select_own" on public.dashboard_days
  for select using (auth.uid() = user_id);

create policy "dashboard_days_insert_own" on public.dashboard_days
  for insert with check (auth.uid() = user_id);

create policy "dashboard_days_update_own" on public.dashboard_days
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dashboard_days_delete_own" on public.dashboard_days
  for delete using (auth.uid() = user_id);

-- Dashboard ingredients
create policy "dashboard_ingredients_select_own" on public.dashboard_ingredients
  for select using (auth.uid() = user_id);

create policy "dashboard_ingredients_insert_own" on public.dashboard_ingredients
  for insert with check (auth.uid() = user_id);

create policy "dashboard_ingredients_update_own" on public.dashboard_ingredients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dashboard_ingredients_delete_own" on public.dashboard_ingredients
  for delete using (auth.uid() = user_id);



  -- Enums para garantir consistência de dados
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'inactive');
create type public.payment_provider as enum ('stripe', 'abacatepay', 'pagarme', 'manual', 'internal');

-- Tabela de Planos (Sua regra de negócio)
create table public.plans (
    id text primary key,
    interval text not null check (interval in ('month', 'year')),
    is_popular boolean default false,
    payment_provider payment_provider not null,
    external_plan_id text not null,
    locales jsonb not null,
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Customers (Ponte entre seu Auth e o Gateway)
-- Mantém o Profile limpo de IDs de terceiros
create table public.customers (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  provider payment_provider not null default 'stripe',
  provider_customer_id text not null unique, -- ex: 'cus_123456'
  created_at timestamp with time zone default now()
);

-- Tabela de Assinaturas (Controle de Acesso)
create table public.subscriptions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text references public.plans(id) on delete set null,
  
  status public.subscription_status not null default 'inactive',
  provider public.payment_provider not null,
  provider_subscription_id text not null unique, 
  
  cancel_at_period_end boolean not null default false,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de Transações (Histórico Financeiro)
create table public.transactions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  
  amount numeric(10, 2) not null,
  currency text not null default 'BRL',
  status text not null, -- 'paid', 'failed', 'refunded'
  
  provider public.payment_provider not null,
  provider_transaction_id text not null unique,
  
  billing_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);


-- Habilitar RLS
alter table public.plans enable row level security;
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

-- Políticas de Leitura
create policy "Qualquer um vê planos ativos" on public.plans for select using (active = true);
create policy "Usuário vê seu próprio registro de customer" on public.customers for select using (auth.uid() = user_id);
create policy "Usuário vê sua própria assinatura" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Usuário vê suas próprias transações" on public.transactions for select using (auth.uid() = user_id);

-- Trigger para Updated_at (Opcional, mas boa prática)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.subscriptions
for each row execute procedure public.handle_updated_at();

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_conditions text[] NOT NULL DEFAULT '{}';


grant select on public.profiles to authenticated;
-- plus as needed:
grant update on public.profiles to authenticated;
grant insert on public.profiles to authenticated;


grant select on public.dashboard_days to authenticated;
-- plus as needed:
grant update on public.dashboard_days to authenticated;
grant insert on public.dashboard_days to authenticated;

grant select on public.dashboard_ingredients to authenticated;
-- plus as needed:
grant update on public.dashboard_ingredients to authenticated;
grant insert on public.dashboard_ingredients to authenticated;

grant select on public.weight_history to authenticated;
-- plus as needed:
grant update on public.weight_history to authenticated;
grant insert on public.weight_history to authenticated;


grant select on public.subscriptions to authenticated;