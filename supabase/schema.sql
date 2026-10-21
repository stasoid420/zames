-- Общий рейтинг миксов ЗАМЕС.
-- Запустить один раз: Supabase → SQL Editor → New query → вставить → Run.

create table if not exists public.ratings (
  recipe text not null check (char_length(recipe) between 1 and 100),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (recipe, user_id)
);

alter table public.ratings enable row level security;

-- Каждый посетитель (анонимный пользователь) видит и меняет только свои оценки
create policy "ratings: read own" on public.ratings
  for select to authenticated using (user_id = (select auth.uid()));
create policy "ratings: insert own" on public.ratings
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "ratings: update own" on public.ratings
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "ratings: delete own" on public.ratings
  for delete to authenticated using (user_id = (select auth.uid()));

-- Средняя оценка и число голосов по каждому миксу — доступно всем
create or replace function public.rating_stats()
returns table (recipe text, avg numeric, votes bigint)
language sql stable security definer set search_path = ''
as $$
  select r.recipe, round(avg(r.rating), 1), count(*)
  from public.ratings r
  group by r.recipe
$$;

grant execute on function public.rating_stats() to anon, authenticated;
