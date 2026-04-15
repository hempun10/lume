-- Add onboarding profile fields
alter table public.profiles
  add column date_of_birth date,
  add column gender text,
  add column region text,
  add column interests text[] default '{}',
  add column onboarding_completed boolean default false not null;

-- Constrain gender to known values
alter table public.profiles
  add constraint profiles_gender_check
  check (gender in ('male', 'female', 'non-binary', 'prefer-not-to-say'));
