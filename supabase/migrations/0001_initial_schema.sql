-- MenMade — initial schema migration
-- Mirrors the types currently in web/app/lib/store.ts so the local store
-- API surface can wrap a Supabase backend without changing any caller.
--
-- All user-owned tables key on auth.users(id). Row-Level Security is
-- enforced in migration 0002. No table here is queryable without a
-- valid auth session.
--
-- Conventions:
--   - updated_at is auto-maintained by a trigger for last-write-wins sync
--   - id columns are uuid, primary key, default uuid_generate_v4()
--   - foreign keys to auth.users use ON DELETE CASCADE so account
--     deletion via /api/account/delete cleans up automatically

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- Helper: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
-- Identity. One row per auth user. Globally-unique handle.
create table public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  handle         text not null unique
                   check (handle ~ '^[a-z0-9_-]{2,32}$'),
  display_name   text not null check (char_length(display_name) between 1 and 80),
  pronouns       text check (char_length(pronouns) <= 40),
  bio            text check (char_length(bio) <= 240),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();
create index profiles_handle_lower_idx on public.profiles (lower(handle));

-- ---------- preferences ----------
-- Onboarding answers: focus areas, intensity, days/week, squad style, timezone.
create table public.preferences (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  focus          text[] not null default '{}',
  intensity      text not null default 'steady'
                   check (intensity in ('light','steady','heavy','brutal')),
  days_per_week  smallint not null default 6
                   check (days_per_week between 4 and 7),
  squad_style    text not null default 'matched'
                   check (squad_style in ('matched','invite','solo')),
  timezone       text not null default 'UTC',
  onboarded      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger preferences_updated_at
  before update on public.preferences
  for each row execute function set_updated_at();

-- ---------- progress ----------
-- Cycle progress, streak, lifetime stats.
create table public.progress (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  current_cycle_code   text,
  current_cycle_day    integer not null default 0,
  streak               integer not null default 0,
  cycles_completed     integer not null default 0,
  total_minutes_logged integer not null default 0,
  last_check_in        timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger progress_updated_at
  before update on public.progress
  for each row execute function set_updated_at();

-- ---------- field_log_entries ----------
-- User's personal log of cycle activity.
create table public.field_log_entries (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  cycle_code   text not null,
  day          integer not null check (day between 1 and 365),
  minutes      integer not null default 0 check (minutes between 0 and 1440),
  note         text not null check (char_length(note) between 1 and 1200),
  logged_at    timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index field_log_user_logged_idx on public.field_log_entries (user_id, logged_at desc);

-- ---------- subscriptions ----------
-- Placeholder for Phase 2 (Stripe wires this fully). Schema is here now
-- so plan-gating utilities can read from it without crashing on a free user.
create table public.subscriptions (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  plan                 text not null default 'free'
                         check (plan in ('free','operator-monthly','operator-annual','founder')),
  stripe_customer_id   text unique,
  stripe_subscription_id text unique,
  started_at           timestamptz,
  renews_at            timestamptz,
  cancelled_at         timestamptz,
  founder_seat_number  integer unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function set_updated_at();
create index subscriptions_plan_idx on public.subscriptions (plan);

-- ---------- notification_prefs ----------
create table public.notification_prefs (
  user_id                   uuid primary key references auth.users(id) on delete cascade,
  cycle_reminder            boolean not null default true,
  cycle_close               boolean not null default true,
  squad_activity            boolean not null default true,
  mentions_only             boolean not null default false,
  squad_lead_announcements  boolean not null default true,
  daily_digest              boolean not null default false,
  weekly_digest             boolean not null default true,
  push                      boolean not null default true,
  email                     boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create trigger notification_prefs_updated_at
  before update on public.notification_prefs
  for each row execute function set_updated_at();

-- ---------- accessibility_prefs ----------
create table public.accessibility_prefs (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  reduce_motion    text not null default 'system'
                     check (reduce_motion in ('system','always','never')),
  text_size        text not null default 'md'
                     check (text_size in ('sm','md','lg')),
  density          text not null default 'comfortable'
                     check (density in ('compact','comfortable')),
  keyboard_hints   boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger accessibility_prefs_updated_at
  before update on public.accessibility_prefs
  for each row execute function set_updated_at();

-- ---------- privacy_prefs ----------
create table public.privacy_prefs (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  marketing_emails         boolean not null default false,
  product_update_emails    boolean not null default true,
  share_squad_activity     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger privacy_prefs_updated_at
  before update on public.privacy_prefs
  for each row execute function set_updated_at();

-- ---------- safety_prefs ----------
create table public.safety_prefs (
  user_id                    uuid primary key references auth.users(id) on delete cascade,
  soft_flagged_visibility    text not null default 'collapse'
                               check (soft_flagged_visibility in ('show','collapse','hide')),
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);
create trigger safety_prefs_updated_at
  before update on public.safety_prefs
  for each row execute function set_updated_at();

-- ---------- blocked_handles ----------
-- Global block list per user. Blocked operative's content is filtered
-- server-side before delivery (see Phase 3 chat moderation).
create table public.blocked_handles (
  user_id      uuid not null references auth.users(id) on delete cascade,
  handle       text not null,
  blocked_at   timestamptz not null default now(),
  primary key (user_id, handle)
);
create index blocked_handles_user_idx on public.blocked_handles (user_id);

-- ---------- handle_reservations ----------
-- Reserved-words blocklist to prevent users grabbing handles like 'admin',
-- 'support', 'menmade', 'help', etc. Seeded with common reservations.
create table public.handle_reservations (
  handle text primary key
);
insert into public.handle_reservations (handle) values
  ('admin'),('administrator'),('mod'),('moderator'),('staff'),
  ('support'),('help'),('contact'),('info'),('press'),('legal'),
  ('menmade'),('founder'),('founders'),('team'),('official'),
  ('null'),('undefined'),('system'),('root'),('test'),
  ('squad'),('squads'),('cycle'),('cycles'),('chat'),('settings');

-- ---------- Auto-create profile rows on user signup ----------
-- When a new auth.users row is inserted (sign-up), bootstrap the
-- minimal per-user rows. Handle + display_name fill from raw_user_meta_data
-- which the sign-up form populates. RLS still applies to subsequent
-- writes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- profiles is created lazily on first onboarding step instead of here,
  -- because the user picks their handle during onboarding. Pre-creating
  -- with auto-generated handles caused too many collisions / squatting.
  --
  -- We DO create the prefs/progress shells so reads never NULL out:
  insert into public.preferences (user_id) values (new.id) on conflict do nothing;
  insert into public.progress (user_id) values (new.id) on conflict do nothing;
  insert into public.notification_prefs (user_id) values (new.id) on conflict do nothing;
  insert into public.accessibility_prefs (user_id) values (new.id) on conflict do nothing;
  insert into public.privacy_prefs (user_id) values (new.id) on conflict do nothing;
  insert into public.safety_prefs (user_id) values (new.id) on conflict do nothing;
  insert into public.subscriptions (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
