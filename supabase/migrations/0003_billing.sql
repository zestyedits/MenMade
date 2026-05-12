-- MenMade — Phase 2: Stripe billing
-- Expands the placeholder `subscriptions` table from 0001 into the
-- source of truth for plan + status, adds `founder_seats` for atomic
-- Founder's Pass seat reservation, and adds `stripe_events` for
-- webhook idempotency.
--
-- All writes to these tables happen through the service role (the
-- /api/billing/webhook handler). The user-facing client only reads.
--
-- DO NOT DROP existing tables — Phase 1 is in production.

-- ---------- subscriptions: add columns ----------
-- Status from Stripe (active, trialing, past_due, canceled, incomplete,
-- incomplete_expired, unpaid). 'none' is our local default for users
-- on the free plan who have never had a paid subscription.
alter table public.subscriptions
  add column if not exists status text not null default 'none'
    check (status in (
      'none','active','trialing','past_due','canceled',
      'incomplete','incomplete_expired','unpaid','paused'
    ));

-- current_period_end is the canonical "valid through" timestamp for
-- gating Operator features after a cancel.
alter table public.subscriptions
  add column if not exists current_period_end timestamptz;

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;

-- ---------- founder_seats ----------
-- Pre-seeded with 500 empty rows so seat reservation is a single
-- SELECT ... FOR UPDATE SKIP LOCKED, which atomically claims the
-- next available seat number under concurrent checkout sessions.
--
-- A reserved seat carries the stripe_session_id so the webhook can
-- match it back to the user on checkout.session.completed and
-- finalize ownership.
create table if not exists public.founder_seats (
  seat_number       int primary key,
  user_id           uuid references auth.users(id) on delete set null,
  claimed_at        timestamptz,
  stripe_session_id text unique
);

create index if not exists founder_seats_user_idx
  on public.founder_seats (user_id) where user_id is not null;

-- Seed seats 1..500 if not already seeded. Idempotent.
insert into public.founder_seats (seat_number)
select gs from generate_series(1, 500) as gs
on conflict (seat_number) do nothing;

-- ---------- stripe_events ----------
-- Webhook idempotency. Insert the Stripe event ID first; if it
-- conflicts, we've already processed this delivery and return 200.
create table if not exists public.stripe_events (
  id           text primary key,
  type         text,
  received_at  timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.founder_seats enable row level security;
alter table public.stripe_events enable row level security;

-- founder_seats: anyone (even anon) can read for the public seat
-- counter on /pricing. No one can write — only the service role
-- (which bypasses RLS) finalizes seats.
drop policy if exists founder_seats_select_anyone on public.founder_seats;
create policy founder_seats_select_anyone on public.founder_seats
  for select using (true);

-- stripe_events: locked down. Only the service role touches this.
-- No select/insert/update/delete policies → all denied for users.

-- ---------- Public count view ----------
-- Reads cheaply (no row scan) and is what /api/founders/count hits.
-- The view returns one row: { claimed, cap }.
create or replace view public.founder_seats_taken_count as
  select
    (select count(*)::int from public.founder_seats where user_id is not null) as claimed,
    500::int as cap;

-- Grant explicit read on the view to anon + authenticated roles so
-- the unauthenticated /api/founders/count endpoint can hit it.
grant select on public.founder_seats_taken_count to anon, authenticated;

-- ---------- claim_next_founder_seat RPC ----------
-- Atomically reserves the lowest unclaimed seat for a given user.
-- Uses SELECT ... FOR UPDATE SKIP LOCKED so concurrent callers get
-- distinct rows (or NULL when sold out). Marks the seat with a
-- placeholder stripe_session_id so it can be reaped if checkout is
-- abandoned. Returns the seat_number, or NULL when no seat is free.
--
-- security definer so it can write founder_seats (which has no user
-- write policy). The function is only callable via the service role
-- from the webhook + checkout routes; no grant to anon/authenticated.
create or replace function public.claim_next_founder_seat(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seat int;
begin
  select seat_number into v_seat
  from public.founder_seats
  where user_id is null and stripe_session_id is null
  order by seat_number
  limit 1
  for update skip locked;

  if v_seat is null then
    return null;
  end if;

  update public.founder_seats
  set stripe_session_id = 'pending:' || p_user_id::text || ':' || extract(epoch from now())::text
  where seat_number = v_seat;

  return v_seat;
end;
$$;

revoke all on function public.claim_next_founder_seat(uuid) from public, anon, authenticated;
-- service_role has implicit access to all functions (bypasses RLS).
