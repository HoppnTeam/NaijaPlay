-- Create token_transactions table
create table if not exists public.token_transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'spend')),
  description text not null
);

-- Add RLS policies
alter table public.token_transactions enable row level security;

create policy "Users can view their own token transactions"
  on public.token_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own token transactions"
  on public.token_transactions for insert
  with check (auth.uid() = user_id);

-- Add token column to profiles if it doesn't exist
do $$ 
begin
  if not exists (select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'profiles' 
    and column_name = 'tokens') 
  then
    alter table public.profiles add column tokens integer default 0 not null;
  end if;
end $$; 