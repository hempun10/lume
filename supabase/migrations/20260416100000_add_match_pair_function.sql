-- Atomic matchmaking primitive: creates a room + flips both queue rows in a
-- single transaction, but only if BOTH users are still `waiting`.
--
-- Returns the new room id on success, or NULL if either user cancelled / was
-- already matched by a concurrent edge function run. This makes the whole
-- matchmaking loop safely idempotent under concurrent execution — if two cron
-- invocations overlap, the first commit wins and the second gets NULL.

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
begin
  if _user_a = _user_b then
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

  return _room_id;
end;
$$;

-- Only the service role (edge function) should call this.
revoke execute on function public.match_pair(uuid, uuid) from public, anon, authenticated;
grant  execute on function public.match_pair(uuid, uuid) to service_role;
