create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  type text not null check (type in ('Ingreso', 'Egreso')),
  category text not null,
  date date not null,
  description text default '',
  payment_method text default 'Otro',
  import_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, import_hash)
);

alter table public.transactions enable row level security;

create policy "Users can read own transactions"
on public.transactions for select
using (auth.uid() = user_id);

create policy "Users can insert own transactions"
on public.transactions for insert
with check (auth.uid() = user_id);

create policy "Users can update own transactions"
on public.transactions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
on public.transactions for delete
using (auth.uid() = user_id);
