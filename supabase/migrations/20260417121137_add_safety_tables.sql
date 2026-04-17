-- Safety baseline: reports, blocks, match_history.
--
-- These three tables power the Trust & Safety features required before a
-- public launch:
--   * reports      — users flag bad actors; moderators review off-platform.
--   * blocks       — mutual invisibility between two users (never re-match).
--   * match_history — every paired room is logged so we can enforce a short
--                    cooldown before the same two users can match again.
--
-- Recent-pair cooldown is 30 minutes (see is_recent_pair() below).

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  reason text not null check (reason in (
    'harassment',
    'nudity',
    'spam',
    'underage',
    'hate_speech',
    'self_harm',
    'other'
  )),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint reports_no_self check (reporter_id <> reported_id)
);

create index reports_reported_idx on reports (reported_id, created_at desc);
create index reports_status_idx on reports (status) where status = 'pending';

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------
create table blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self check (blocker_id <> blocked_id),
  constraint blocks_unique unique (blocker_id, blocked_id)
);

create index blocks_blocker_idx on blocks (blocker_id);
create index blocks_blocked_idx on blocks (blocked_id);

-- ---------------------------------------------------------------------------
-- match_history — one row per successful pairing, used for cooldown checks.
-- Pair is stored in canonical order (user_a < user_b) so uniqueness/lookups
-- are symmetric.
-- ---------------------------------------------------------------------------
create table match_history (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  matched_at timestamptz not null default now(),
  constraint match_history_ordered check (user_a < user_b)
);

create index match_history_user_a_idx on match_history (user_a, matched_at desc);
create index match_history_user_b_idx on match_history (user_b, matched_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Canonicalise a pair of user ids so we can do symmetric lookups.
create or replace function public.canonical_pair(_a uuid, _b uuid)
returns table (user_a uuid, user_b uuid)
language sql
immutable
as $$
  select least(_a, _b), greatest(_a, _b);
$$;

-- Has this pair matched in the last 30 minutes?
create or replace function public.is_recent_pair(_a uuid, _b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from match_history mh, canonical_pair(_a, _b) cp
    where mh.user_a = cp.user_a
      and mh.user_b = cp.user_b
      and mh.matched_at > now() - interval '30 minutes'
  );
$$;

-- Is either user blocking the other?
create or replace function public.is_blocked_pair(_a uuid, _b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from blocks
    where (blocker_id = _a and blocked_id = _b)
       or (blocker_id = _b and blocked_id = _a)
  );
$$;

-- ---------------------------------------------------------------------------
-- Update match_pair RPC to reject blocked pairs and recent pairs, and to log
-- match_history on success.
-- ---------------------------------------------------------------------------
create or replace function public.match_pair(_user_a uuid, _user_b uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _room_id uuid;
  _a_waiting boolean;
  _b_waiting boolean;
  _canon_a uuid;
  _canon_b uuid;
begin
  if _user_a = _user_b then
    return null;
  end if;

  -- Reject if either user blocked the other.
  if is_blocked_pair(_user_a, _user_b) then
    return null;
  end if;

  -- Reject if they matched recently (30 min cooldown).
  if is_recent_pair(_user_a, _user_b) then
    return null;
  end if;

  -- Lock both waiting rows (if they still exist). FOR UPDATE serialises any
  -- concurrent match_pair() call touching the same users.
  select exists (
    select 1 from match_queue
    where user_id = _user_a and status = 'waiting'
    for update
  ) into _a_waiting;

  select exists (
    select 1 from match_queue
    where user_id = _user_b and status = 'waiting'
    for update
  ) into _b_waiting;

  if not _a_waiting or not _b_waiting then
    return null;
  end if;

  insert into rooms (type, user_a, user_b, status)
  values ('chat', _user_a, _user_b, 'active')
  returning id into _room_id;

  update match_queue
  set status = 'matched', matched_with = _user_b, room_id = _room_id
  where user_id = _user_a and status = 'waiting';

  update match_queue
  set status = 'matched', matched_with = _user_a, room_id = _room_id
  where user_id = _user_b and status = 'waiting';

  -- Log to history in canonical order so lookups are symmetric.
  select least(_user_a, _user_b), greatest(_user_a, _user_b)
    into _canon_a, _canon_b;

  insert into match_history (user_a, user_b, room_id)
  values (_canon_a, _canon_b, _room_id);

  return _room_id;
end;
$$;

revoke execute on function public.match_pair(uuid, uuid) from public, anon, authenticated;
grant  execute on function public.match_pair(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table reports enable row level security;
alter table blocks enable row level security;
alter table match_history enable row level security;

-- reports: users can file reports and see their own, but cannot see who
-- reported them or modify existing reports.
create policy "users_insert_own_reports" on reports
  for insert with check (auth.uid() = reporter_id);

create policy "users_select_own_reports" on reports
  for select using (auth.uid() = reporter_id);

-- blocks: users manage their own block list and see who they've blocked.
-- They should NOT be able to see who has blocked them (mutual-invisibility
-- requirement) — enforced by only allowing SELECT on rows where you are the
-- blocker.
create policy "users_insert_own_blocks" on blocks
  for insert with check (auth.uid() = blocker_id);

create policy "users_select_own_blocks" on blocks
  for select using (auth.uid() = blocker_id);

create policy "users_delete_own_blocks" on blocks
  for delete using (auth.uid() = blocker_id);

-- match_history: users can see rows they're part of (for debugging / "recent
-- matches" UI later). Writes only happen via match_pair() as service_role.
create policy "users_select_own_history" on match_history
  for select using (auth.uid() = user_a or auth.uid() = user_b);
