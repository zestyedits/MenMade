-- MenMade — Phase 3a: squads, chat, moderation.
--
-- Adds:
--   1. squads                — squad rows. Singleton "Founders Circle" seeded.
--   2. squad_members         — membership rows (squad_id, user_id, role).
--   3. messages              — chat messages, paginated by (squad_id, sent_at).
--   4. reports               — user reports on a specific message. Immutable.
--   5. mod_actions           — append-only audit trail for App Store appeals.
--
-- Cold-start protocol: matched users join the seeded Founders Circle until a
-- 5-man focused cohort can spin off. Graduation logic ships in Phase 3b — for
-- now everyone stays in the Circle. The partial unique index on kind prevents
-- spawning a second Circle by accident.
--
-- Service role bypasses RLS; writes happen from /api/squads/* and
-- /api/chat/* route handlers using createAdminClient(). UI uses the
-- user-scoped client and reads are RLS-gated on membership.
--
-- DO NOT DROP existing tables. This migration is additive.

-- ---------- squads ----------
create table if not exists public.squads (
  id            uuid primary key default gen_random_uuid(),
  handle        text not null unique check (handle ~ '^[a-z0-9-]{2,40}$'),
  name          text not null check (char_length(name) between 1 and 80),
  kind          text not null default 'private'
                  check (kind in ('private','founders_circle')),
  -- focus/intensity/tz_band describe the squad's identity once a focused cohort
  -- spawns. Null on the Founders Circle (it's mixed by definition).
  focus         text[] null,
  intensity     text null check (intensity is null or intensity in
                  ('light','steady','heavy','brutal')),
  tz_band       text null,
  cycle_code    text null,
  cycle_day     int not null default 1 check (cycle_day >= 1),
  total_days    int null check (total_days is null or total_days between 1 and 365),
  blurb         text null check (blurb is null or char_length(blurb) <= 500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger squads_updated_at
  before update on public.squads
  for each row execute function set_updated_at();

-- At most one Founders Circle, ever. Partial unique index over the kind column
-- enforces it at the storage layer.
create unique index if not exists squads_singleton_circle_idx
  on public.squads (kind)
  where kind = 'founders_circle';

-- ---------- squad_members ----------
create table if not exists public.squad_members (
  squad_id     uuid not null references public.squads(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member'
                 check (role in ('member','lead','founder')),
  joined_at    timestamptz not null default now(),
  left_at      timestamptz null,
  primary key (squad_id, user_id)
);

-- Hot path: "list this user's active squad memberships."
create index if not exists squad_members_user_active_idx
  on public.squad_members (user_id, left_at);

-- ---------- messages ----------
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  squad_id          uuid not null references public.squads(id) on delete cascade,
  author_user_id    uuid not null references auth.users(id) on delete cascade,
  -- Denormalized author handle/name. Renders fast and keeps history readable
  -- if the author later changes their handle. The "current handle" lives on
  -- profiles; this column is the snapshot at send time.
  author_handle     text not null,
  author_name       text not null,
  body              text not null check (char_length(body) between 1 and 2000),
  -- Shape matches the client `Record<ChatReaction, number>`. Stored as jsonb
  -- so reactions can update atomically with `jsonb_set` without rewriting
  -- the row's text columns.
  reactions         jsonb not null default '{}'::jsonb,
  stamp_id          text null check (stamp_id is null or char_length(stamp_id) <= 40),
  soft_flagged      boolean not null default false,
  hard_blocked      boolean not null default false,
  sent_at           timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Paginated history: newest-first within a squad.
create index if not exists messages_squad_sent_idx
  on public.messages (squad_id, sent_at desc);

-- ---------- reports ----------
create table if not exists public.reports (
  id                  uuid primary key default gen_random_uuid(),
  reporter_user_id    uuid not null references auth.users(id) on delete cascade,
  message_id          uuid not null references public.messages(id) on delete cascade,
  squad_id            uuid not null references public.squads(id) on delete cascade,
  reason              text null check (reason is null or char_length(reason) <= 500),
  created_at          timestamptz not null default now()
);

-- Squad-lead view: "what got reported in my squad lately?"
create index if not exists reports_squad_created_idx
  on public.reports (squad_id, created_at desc);

-- ---------- mod_actions ----------
-- Append-only audit log. Required for App Store UGC appeals. NO update or
-- delete policy at all — once written, it stays written.
create table if not exists public.mod_actions (
  id                uuid primary key default gen_random_uuid(),
  action            text not null check (action in (
                      'hard_blocked','soft_flagged','reported',
                      'message_deleted','user_muted','user_kicked',
                      'graduated_from_circle'
                    )),
  target_user_id    uuid null references auth.users(id) on delete set null,
  squad_id          uuid null references public.squads(id) on delete set null,
  message_id        uuid null references public.messages(id) on delete set null,
  body_excerpt      text null check (body_excerpt is null or char_length(body_excerpt) <= 200),
  metadata          jsonb null,
  created_at        timestamptz not null default now()
);

create index if not exists mod_actions_created_idx
  on public.mod_actions (created_at desc);

create index if not exists mod_actions_target_idx
  on public.mod_actions (target_user_id);

-- ---------- RLS ----------
alter table public.squads          enable row level security;
alter table public.squad_members   enable row level security;
alter table public.messages        enable row level security;
alter table public.reports         enable row level security;
alter table public.mod_actions     enable row level security;

-- Squads: member of the squad can read it. Service role writes.
drop policy if exists squads_select_member on public.squads;
create policy squads_select_member on public.squads
  for select using (
    exists (
      select 1 from public.squad_members m
      where m.squad_id = squads.id
        and m.user_id = auth.uid()
        and m.left_at is null
    )
  );

-- Squad members: a user reads rows from any squad they themselves belong to.
-- This lets the roster surface load. No client write policy — joins go
-- through service-role API routes that perform their own membership checks.
drop policy if exists squad_members_select_in_my_squads on public.squad_members;
create policy squad_members_select_in_my_squads on public.squad_members
  for select using (
    exists (
      select 1 from public.squad_members me
      where me.squad_id = squad_members.squad_id
        and me.user_id = auth.uid()
        and me.left_at is null
    )
  );

-- Messages: visible to a squad member, hard-blocked rows excluded. Per-user
-- block-list filtering happens at the API layer (joining against
-- blocked_handles), because RLS can't easily join author handle to block list.
drop policy if exists messages_select_member on public.messages;
create policy messages_select_member on public.messages
  for select using (
    hard_blocked = false
    and exists (
      select 1 from public.squad_members m
      where m.squad_id = messages.squad_id
        and m.user_id = auth.uid()
        and m.left_at is null
    )
  );

-- No client INSERT/UPDATE/DELETE policy on messages. /api/chat/messages
-- uses service-role to write after running the moderation pipeline.

-- Reports: a reporter inserts their own rows, sees their own rows.
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert with check (reporter_user_id = auth.uid());

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select using (reporter_user_id = auth.uid());

-- mod_actions: authenticated read (gated by app surface); service-role writes.
drop policy if exists mod_actions_select_authenticated on public.mod_actions;
create policy mod_actions_select_authenticated on public.mod_actions
  for select using (auth.role() = 'authenticated');

-- ---------- Seed: the Founders Circle ----------
-- ON CONFLICT keeps this idempotent across re-runs in dev.
insert into public.squads (handle, name, kind, blurb)
values (
  'founders-circle',
  'Founders Circle',
  'founders_circle',
  'Everyone enlisted so far. Your focused squad spins off when 5 men line up.'
)
on conflict (handle) do nothing;

-- ---------- Realtime: publish messages INSERTs ----------
-- The Supabase realtime extension subscribes to logical replication; tables
-- must be added to the publication explicitly. Without this, the chat page's
-- supabase.channel('chat:<id>') subscription would never receive INSERTs.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
