-- Mahjong Focus Arena MVP schema.
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  city text not null default 'Almaty',
  avatar_url text,
  is_pro boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('classic', 'daily')),
  challenge_date date,
  board_seed text not null,
  status text not null default 'completed' check (status in ('completed', 'abandoned')),
  score integer not null check (score >= 0),
  duration_seconds integer not null check (duration_seconds > 0),
  moves_count integer not null check (moves_count > 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  shuffles_used integer not null default 0 check (shuffles_used >= 0),
  undo_count integer not null default 0 check (undo_count >= 0),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint daily_games_require_challenge_date
    check (mode <> 'daily' or challenge_date is not null)
);

create index if not exists games_user_id_idx on public.games(user_id);
create index if not exists games_mode_idx on public.games(mode);
create index if not exists games_challenge_date_idx on public.games(challenge_date);
create index if not exists games_score_idx on public.games(score desc);
create index if not exists games_duration_idx on public.games(duration_seconds asc);
create index if not exists profiles_city_idx on public.profiles(city);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.get_leaderboard_entries(
  p_mode text default null,
  p_city text default null,
  p_challenge_date date default null,
  p_limit integer default 50
)
returns table (
  nickname text,
  city text,
  score integer,
  duration_seconds integer,
  mode text,
  challenge_date date,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.nickname,
    p.city,
    g.score,
    g.duration_seconds,
    g.mode,
    g.challenge_date,
    g.created_at
  from public.games g
  join public.profiles p on p.id = g.user_id
  where g.status = 'completed'
    and (p_mode is null or g.mode = p_mode)
    and (p_city is null or lower(p.city) = lower(p_city))
    and (p_challenge_date is null or g.challenge_date = p_challenge_date)
  order by g.score desc, g.duration_seconds asc, g.created_at asc
  limit least(greatest(p_limit, 1), 100);
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can insert their own games" on public.games;
create policy "Users can insert their own games"
on public.games for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and duration_seconds > 0
  and score >= 0
  and moves_count > 0
  and mode in ('classic', 'daily')
  and (mode <> 'daily' or challenge_date is not null)
);

drop policy if exists "Users can read their own games" on public.games;
create policy "Users can read their own games"
on public.games for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own games" on public.games;
create policy "Users can update their own games"
on public.games for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.games to authenticated;
revoke all on function public.get_leaderboard_entries(text, text, date, integer) from public;
grant execute on function public.get_leaderboard_entries(text, text, date, integer) to anon, authenticated;
