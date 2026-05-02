-- Allow reading the counterpart's profile when two users share an active room.
--
-- Background: the original "Users can read own profile" policy was the only
-- SELECT policy on `public.profiles`, which meant `useStrangerProfile` (and
-- transitively the in-chat prompt suggestions + shared-interests banner)
-- received an empty payload for the other user — silently. The chat UI fell
-- back to generic prompts and never showed shared interests, even though both
-- features were wired up.
--
-- This policy is narrowly scoped: a user can read another profile ONLY if
-- they are currently the counterpart in a `public.rooms` row. It does NOT
-- expose profiles globally.
create policy "Users can read room counterpart profile"
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.rooms r
    where (r.user_a = auth.uid() and r.user_b = profiles.id)
       or (r.user_b = auth.uid() and r.user_a = profiles.id)
  )
);
