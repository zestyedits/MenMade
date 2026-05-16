-- MenMade — Phase 3a security audit fixes.
--
-- Findings addressed (severities from /home/codespace/.claude/projects/-workspaces-MenMade/memory):
--   C1  Realtime postgres_changes bypassed RLS — remove `messages` from
--       the supabase_realtime publication. Client falls back to short-poll
--       via /api/chat/messages?since=... until proper Realtime Authorization
--       (private channels + realtime.messages RLS) is wired in Phase 3b.
--   H2  mod_actions_select_authenticated policy let any signed-in user read
--       moderation excerpts → service-role-only. Curated reads go through
--       /api/admin/* surfaces.
--   M3  Reports were dupable per (reporter, message) — adds unique index.
--   H3  Block list keyed on handle only — add blocked_user_id column so
--       renames don't bypass the filter. Existing handle column kept for
--       back-compat with the dashboard surface.

-- ---------- C1: pull messages out of realtime publication ----------
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime drop table public.messages;
  end if;
end $$;

-- ---------- H2: revoke broad mod_actions SELECT ----------
drop policy if exists mod_actions_select_authenticated on public.mod_actions;
-- No replacement policy. Reads happen exclusively via service-role
-- in /api/admin/* routes (admin allowlist gated).

-- ---------- M3: unique reports per (reporter, message) ----------
create unique index if not exists reports_unique_per_reporter
  on public.reports (reporter_user_id, message_id);

-- ---------- H3: block-list keyed on user_id ----------
alter table public.blocked_handles
  add column if not exists blocked_user_id uuid null
    references auth.users(id) on delete cascade;

create index if not exists blocked_handles_blocked_user_idx
  on public.blocked_handles (user_id, blocked_user_id)
  where blocked_user_id is not null;
