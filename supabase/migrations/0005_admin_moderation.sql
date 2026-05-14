-- MenMade — Phase 3+: admin moderation, audit log, concern signals.
--
-- Adds:
--   1. profiles.suspended_at + suspension_reason          (soft-ban)
--   2. admin_actions                                       (immutable audit log)
--   3. concern_signals                                     (Buddy's data source)
--
-- Conventions:
--   - Service role bypasses RLS; all writes happen from /api/admin/* route
--     handlers using createAdminClient(). UI uses user-scoped client.
--   - admin_actions has NO update/delete policy by design — once written,
--     it stays written. Tamper-evident at the policy layer.
--
-- DO NOT DROP existing tables. This migration is additive.

-- ---------- profiles: soft-ban columns ----------
alter table public.profiles
  add column if not exists suspended_at timestamptz null;

alter table public.profiles
  add column if not exists suspension_reason text null
    check (suspension_reason is null or char_length(suspension_reason) <= 500);

create index if not exists profiles_suspended_at_idx
  on public.profiles (suspended_at)
  where suspended_at is not null;

-- ---------- admin_actions: tamper-evident audit log ----------
create table if not exists public.admin_actions (
  id                 uuid primary key default gen_random_uuid(),
  admin_user_id      uuid not null references auth.users(id),
  action             text not null check (action in (
    'user_suspended','user_unsuspended','user_deleted','user_updated',
    'password_reset_sent','founder_seat_granted','founder_seat_revoked',
    'refund_issued','admin_promoted','admin_demoted'
  )),
  -- target_user_id is nullable because user_deleted captures a row whose
  -- target gets cascaded away. We keep target_email so the trail survives.
  target_user_id     uuid null references auth.users(id) on delete set null,
  target_email       text null,
  metadata           jsonb null,
  created_at         timestamptz not null default now()
);

create index if not exists admin_actions_created_idx
  on public.admin_actions (created_at desc);

create index if not exists admin_actions_target_idx
  on public.admin_actions (target_user_id);

alter table public.admin_actions enable row level security;

-- Admins read all rows. We don't have a role column (admin = env allowlist),
-- so the easiest read policy is: any authenticated user can SELECT, and the
-- application layer (requireAdmin) gates the surface. The data isn't a
-- secret — it's an audit trail. If a non-admin somehow queried the table
-- directly, they'd just see admin emails doing admin things. Acceptable
-- exposure given the surface is gated, but we still keep RLS on to forbid
-- writes via cookie-borne JWTs.
drop policy if exists admin_actions_select_authenticated on public.admin_actions;
create policy admin_actions_select_authenticated on public.admin_actions
  for select using (auth.role() = 'authenticated');

-- No insert/update/delete policy. Only service_role can write.

-- ---------- concern_signals: Buddy's feed ----------
create table if not exists public.concern_signals (
  id                uuid primary key default gen_random_uuid(),
  kind              text not null check (kind in (
    'payment_failed','refund_issued','account_deleted','rate_limit_hit',
    'honeypot_tripped','webhook_delivery_lag','user_reported',
    'admin_review_requested','signup_burst'
  )),
  severity          text not null check (severity in ('low','medium','high')),
  title             text not null check (char_length(title) between 1 and 200),
  body              text null check (body is null or char_length(body) <= 1000),
  related_user_id   uuid null references auth.users(id) on delete set null,
  related_email     text null,
  metadata          jsonb null,
  dismissed_at      timestamptz null,
  dismissed_by      uuid null references auth.users(id),
  created_at        timestamptz not null default now()
);

-- Buddy panel reads the open feed; the (dismissed_at, created_at desc) index
-- is the hot path. `dismissed_at is null` queries match the partial index.
create index if not exists concern_signals_open_idx
  on public.concern_signals (dismissed_at, created_at desc);

create index if not exists concern_signals_kind_idx
  on public.concern_signals (kind);

alter table public.concern_signals enable row level security;

-- Same logic as admin_actions: gated by application, read by any
-- authenticated user. Service role writes; admins (via UI → API)
-- dismiss via a service-role-backed route, so no public UPDATE policy.
drop policy if exists concern_signals_select_authenticated on public.concern_signals;
create policy concern_signals_select_authenticated on public.concern_signals
  for select using (auth.role() = 'authenticated');

-- No insert/update/delete policy. Only service_role can write.
