-- Shorten the recent-pair cooldown from 30 minutes to 1 minute.
-- Matches RECENT_PAIR_WINDOW_MS in supabase/functions/match-users/constants.ts.
-- Useful during demos/testing so the same two users can re-match quickly.

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
      and mh.matched_at > now() - interval '1 minute'
  );
$$;
