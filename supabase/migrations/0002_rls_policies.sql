-- MenMade — Row-Level Security policies
-- Every user-owned table enforces "you can only read/write your own rows"
-- at the database layer. This means our API routes can be thin —
-- they pass the user's JWT through and Postgres rejects unauthorized
-- access regardless of any application-layer bugs.
--
-- handle_reservations is the only public-read table; the rest are
-- strict per-user.

-- ---------- Enable RLS on every public table ----------
alter table public.profiles            enable row level security;
alter table public.preferences         enable row level security;
alter table public.progress            enable row level security;
alter table public.field_log_entries   enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.notification_prefs  enable row level security;
alter table public.accessibility_prefs enable row level security;
alter table public.privacy_prefs       enable row level security;
alter table public.safety_prefs        enable row level security;
alter table public.blocked_handles     enable row level security;
alter table public.handle_reservations enable row level security;

-- ---------- profiles ----------
-- A user can read their own profile. Anyone authenticated can read
-- another profile by handle (for @mentions, squad rosters, public-ish
-- look-ups). Only the owner can write.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = user_id);
create policy profiles_select_any_authenticated on public.profiles
  for select using (auth.role() = 'authenticated');
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = user_id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = user_id);
create policy profiles_delete_own on public.profiles
  for delete using (auth.uid() = user_id);

-- ---------- preferences / progress / *_prefs / subscriptions ----------
-- Per-user, owner-only. Subscriptions are read-only to the user — only
-- the webhook (service role) can write.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'preferences','progress','notification_prefs','accessibility_prefs',
      'privacy_prefs','safety_prefs'
    ])
  loop
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id);', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id);', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id);', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id);', t || '_delete_own', t);
  end loop;
end$$;

-- subscriptions: read-only to the user, write requires service role.
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);
-- (no insert/update/delete policy → only service_role bypass can write)

-- ---------- field_log_entries ----------
-- A user can read and write only their own entries.
-- (Squad-wide field log queries in Phase 3 use a separate squad-aware view.)
create policy field_log_select_own on public.field_log_entries
  for select using (auth.uid() = user_id);
create policy field_log_insert_own on public.field_log_entries
  for insert with check (auth.uid() = user_id);
create policy field_log_update_own on public.field_log_entries
  for update using (auth.uid() = user_id);
create policy field_log_delete_own on public.field_log_entries
  for delete using (auth.uid() = user_id);

-- ---------- blocked_handles ----------
-- Own-rows only. Server uses these to filter chat delivery in Phase 3.
create policy blocked_handles_select_own on public.blocked_handles
  for select using (auth.uid() = user_id);
create policy blocked_handles_insert_own on public.blocked_handles
  for insert with check (auth.uid() = user_id);
create policy blocked_handles_delete_own on public.blocked_handles
  for delete using (auth.uid() = user_id);

-- ---------- handle_reservations ----------
-- World-readable so the onboarding form can check handle availability
-- without a service-role call. No one (not even authenticated users)
-- can write — these are seeded by migrations and managed by us.
create policy handle_reservations_select_anyone on public.handle_reservations
  for select using (true);
