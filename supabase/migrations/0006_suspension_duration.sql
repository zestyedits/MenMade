-- MenMade — admin suspensions: optional duration + email notification flag.
--
-- Adds:
--   1. profiles.suspended_until      — null = indefinite; otherwise auto-lift at this time
--   2. profiles.suspension_notified_at — when the suspension email was sent
--
-- Sign-in check (auth.ts) treats a user as suspended only when:
--   suspended_at is not null AND (suspended_until is null OR suspended_until > now())
-- This means a timed suspension self-lifts without a cron — sign-in
-- silently starts working again past the expiry.
--
-- DO NOT DROP existing columns. Additive only.

alter table public.profiles
  add column if not exists suspended_until timestamptz null;

alter table public.profiles
  add column if not exists suspension_notified_at timestamptz null;

-- Helpful for "find expired suspensions to dismiss-as-resolved" queries
-- (when we eventually run that hygiene job).
create index if not exists profiles_suspended_until_idx
  on public.profiles (suspended_until)
  where suspended_until is not null;
