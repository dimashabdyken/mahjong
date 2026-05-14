-- Mahjong Focus Arena demo seed data.
--
-- This script intentionally does NOT create Supabase Auth users.
-- First create these users in Supabase Dashboard > Authentication > Users:
--
--   YOUR_EMAIL+ayan@gmail.com   / Demo123456!
--   YOUR_EMAIL+dana@gmail.com   / Demo123456!
--   YOUR_EMAIL+arman@gmail.com  / Demo123456!
--   YOUR_EMAIL+sara@gmail.com   / Demo123456!
--
-- Then replace the four email values below with the exact emails you created
-- and run this script in the Supabase SQL Editor.

begin;

with demo_users(email, nickname, city) as (
  values
    ('YOUR_EMAIL+ayan@gmail.com', 'Ayan', 'Almaty'),
    ('YOUR_EMAIL+dana@gmail.com', 'Dana', 'Almaty'),
    ('YOUR_EMAIL+arman@gmail.com', 'Arman', 'Astana'),
    ('YOUR_EMAIL+sara@gmail.com', 'Sara', 'Shymkent')
),
resolved_users as (
  select
    u.id,
    d.email,
    d.nickname,
    d.city
  from demo_users d
  join auth.users u on lower(u.email) = lower(d.email)
),
upsert_profiles as (
  insert into public.profiles (id, nickname, city, is_pro)
  select id, nickname, city, false
  from resolved_users
  on conflict (id) do update
  set
    nickname = excluded.nickname,
    city = excluded.city,
    is_pro = false
  returning id
),
classic_games(user_id, board_seed, score, duration_seconds, moves_count, hints_used, shuffles_used, undo_count) as (
  select id, 'classic-medium-demo-ayan', 8800, 260, 58, 1, 0, 2 from resolved_users where nickname = 'Ayan'
  union all
  select id, 'classic-medium-demo-dana', 8400, 295, 63, 2, 1, 1 from resolved_users where nickname = 'Dana'
  union all
  select id, 'classic-medium-demo-arman', 7600, 340, 70, 3, 1, 2 from resolved_users where nickname = 'Arman'
  union all
  select id, 'classic-medium-demo-sara', 7100, 410, 82, 4, 2, 3 from resolved_users where nickname = 'Sara'
),
insert_classic as (
  insert into public.games (
    user_id,
    mode,
    challenge_date,
    board_seed,
    status,
    score,
    duration_seconds,
    moves_count,
    hints_used,
    shuffles_used,
    undo_count,
    completed_at
  )
  select
    user_id,
    'classic',
    null,
    board_seed,
    'completed',
    score,
    duration_seconds,
    moves_count,
    hints_used,
    shuffles_used,
    undo_count,
    now() - interval '2 hours'
  from classic_games cg
  where not exists (
    select 1
    from public.games g
    where g.user_id = cg.user_id
      and g.mode = 'classic'
      and g.board_seed = cg.board_seed
  )
  returning id
),
daily_games(user_id, score, duration_seconds, moves_count, hints_used, shuffles_used, undo_count) as (
  select id, 9300, 240, 52, 0, 0, 1 from resolved_users where nickname = 'Ayan'
  union all
  select id, 8900, 275, 60, 1, 0, 1 from resolved_users where nickname = 'Dana'
  union all
  select id, 8000, 330, 69, 2, 1, 2 from resolved_users where nickname = 'Arman'
  union all
  select id, 7400, 405, 80, 3, 1, 3 from resolved_users where nickname = 'Sara'
),
insert_daily as (
  insert into public.games (
    user_id,
    mode,
    challenge_date,
    board_seed,
    status,
    score,
    duration_seconds,
    moves_count,
    hints_used,
    shuffles_used,
    undo_count,
    completed_at
  )
  select
    user_id,
    'daily',
    current_date,
    'daily-' || current_date::text,
    'completed',
    score,
    duration_seconds,
    moves_count,
    hints_used,
    shuffles_used,
    undo_count,
    now() - interval '1 hour'
  from daily_games dg
  where not exists (
    select 1
    from public.games g
    where g.user_id = dg.user_id
      and g.mode = 'daily'
      and g.challenge_date = current_date
      and g.board_seed = 'daily-' || current_date::text
  )
  returning id
)
select
  (select count(*) from resolved_users) as auth_users_found,
  (select count(*) from upsert_profiles) as profiles_upserted,
  (select count(*) from insert_classic) as classic_games_inserted,
  (select count(*) from insert_daily) as daily_games_inserted;

commit;

-- Verification checks.

select
  to_regclass('public.profiles') is not null as profiles_table_exists,
  to_regclass('public.games') is not null as games_table_exists,
  (
    select c.conname is not null
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and c.contype = 'f'
      and pg_get_constraintdef(c.oid) ilike '%auth.users%'
    limit 1
  ) as profiles_references_auth_users,
  (
    select c.conname is not null
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'games'
      and c.contype = 'f'
      and pg_get_constraintdef(c.oid) ilike '%auth.users%'
    limit 1
  ) as games_references_auth_users,
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.profiles'::regclass
  ) as profiles_rls_enabled,
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.games'::regclass
  ) as games_rls_enabled,
  to_regprocedure('public.get_leaderboard_entries(text,text,date,integer)') is not null as leaderboard_rpc_exists;

select *
from public.get_leaderboard_entries(null, null, null, 50);

select *
from public.get_leaderboard_entries('classic', null, null, 50);

select *
from public.get_leaderboard_entries('daily', null, current_date, 50);

select *
from public.get_leaderboard_entries(null, 'Almaty', null, 50);
