-- 0009_cycle_templates.sql
-- Backs the dashboard CycleStrip + the standalone /cycles page with real
-- cycle metadata (name, totalDays) instead of mock data, and records when
-- a user actually started their current cycle so the elapsed counter is
-- truthful.
--
-- Two changes:
--   1. New `cycle_templates` table — read-only catalogue of cycles a user
--      can be in. Seeded with the P-014 "Build something that breathes"
--      cycle that the prototype uses. Code is the natural key; the
--      `progress.current_cycle_code` text column points at it.
--   2. `progress.current_cycle_started_at` timestamptz column — when this
--      user's current cycle was kicked off. Populated on onboarding finish
--      (existing rows backfilled to created_at).
--
-- RLS: cycle_templates is public-readable (catalogue), service-role
-- writeable. Nothing here is user-scoped.

-- ---------- cycle_templates ----------
create table if not exists public.cycle_templates (
  code         text primary key,
  name         text not null,
  total_days   integer not null check (total_days between 1 and 365),
  blurb        text,
  created_at   timestamptz not null default now()
);

alter table public.cycle_templates enable row level security;

drop policy if exists cycle_templates_select_anyone on public.cycle_templates;
create policy cycle_templates_select_anyone on public.cycle_templates
  for select using (true);

insert into public.cycle_templates (code, name, total_days, blurb)
values
  (
    'P-014',
    'Build something that breathes',
    30,
    '30 days. One thing built with your hands. Documented every day. Squad watching.'
  )
on conflict (code) do nothing;

-- ---------- progress.current_cycle_started_at ----------
alter table public.progress
  add column if not exists current_cycle_started_at timestamptz;

-- Backfill existing rows so the elapsed counter has a sane value. For
-- pre-existing users who never explicitly started a cycle, fall back to
-- their profile creation timestamp.
update public.progress
   set current_cycle_started_at = coalesce(current_cycle_started_at, created_at)
 where current_cycle_started_at is null;
