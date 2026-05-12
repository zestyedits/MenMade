# Supabase Setup — Phase 1

This is what **you** need to do in the Supabase dashboard before I can wire the rest of Phase 1 in code. About 20–30 minutes of manual work.

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Name: `menmade-prod` (or whatever).
3. Database password: generate one and save it to your password manager. You won't use it day-to-day but you'll need it for direct DB access later.
4. Region: pick the one closest to your real users (US East / EU West are the usual picks).
5. Plan: **Free** tier is fine for Phase 1. Upgrade to Pro ($25/mo) when you submit to public users.

Wait ~2 minutes for the project to provision.

## 2. Run the migrations

The two migration files in `supabase/migrations/` define the schema and RLS.

**Option A — SQL Editor (easiest for first time):**
1. Supabase dashboard → **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_initial_schema.sql` in your editor. Copy the entire contents into the SQL Editor. Click **Run**.
3. Same for `supabase/migrations/0002_rls_policies.sql`. Click **Run**.

After both run, check **Database → Tables** in the dashboard. You should see 11 tables: `profiles`, `preferences`, `progress`, `field_log_entries`, `subscriptions`, `notification_prefs`, `accessibility_prefs`, `privacy_prefs`, `safety_prefs`, `blocked_handles`, `handle_reservations`.

**Option B — Supabase CLI (better long-term):**
```bash
npm install -g supabase
cd /workspaces/MenMade
supabase login                       # opens browser
supabase link --project-ref <your-project-ref>   # ref is in your dashboard URL
supabase db push                     # applies all migrations in order
```

## 3. Configure Apple Sign In

Apple is the only social auth we ship in Phase 1. (Email/password works out of the box.)

You'll need:
- An Apple Developer account ($99/year).
- A **Services ID** (e.g., `app.menmade.signin`) created in the Apple Developer portal under **Identifiers**.
- A **Sign In with Apple key** (downloads a `.p8` file).
- Your team ID + key ID + the `.p8` contents.

In Supabase dashboard → **Authentication → Providers → Apple**:
1. Enable Apple.
2. Paste the Services ID as **Client ID**.
3. Paste the team ID + key ID + the entire `.p8` contents (Supabase will sign client secrets for you).
4. Add redirect URL in Apple Developer portal: `https://<your-project-ref>.supabase.co/auth/v1/callback`.

**Email/password auth** is on by default. Confirm in **Authentication → Providers → Email** that "Enable Email Provider" is on. Decide whether you want "Confirm email" on (recommended for production; off is fine for dev).

## 4. Configure Supabase Auth email templates

Supabase sends auth emails (signup confirmation, password reset, email change) from a default address. To send them from `noreply@menmade.app` via Resend instead:

In **Authentication → Email Templates** → **SMTP settings**:
- Sender email: `noreply@menmade.app`
- Sender name: `MenMade`
- Host: `smtp.resend.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: `resend`
- Password: your Resend API key (yes, the password field takes the API key)

Save. Send yourself a test password reset to confirm it works.

The default email content is fine for now — we'll replace with branded react-email templates in Phase 4.

## 5. Get the env vars

In **Settings → API**, copy three values into `web/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... (long, public)
SUPABASE_SERVICE_ROLE_KEY=eyJh... (long, SECRET — never commit, never paste in chat)
```

Restart `npm run dev` after editing `.env.local`.

## 6. Verify

Run:
```bash
cd /workspaces/MenMade/web
curl http://localhost:3000/api/healthz
```

(I'll add this healthz route in the next step — it pings the DB and returns 200 if everything's wired.)

## What's next after you finish this

Once you tell me the project is provisioned and the env vars are in place, I'll:
1. Add a `/api/healthz` route that confirms the DB connection
2. Rewrite `web/app/lib/auth.ts` to use the Supabase SSR client
3. Wrap `web/app/lib/store.ts` with the sync layer (localStorage → Supabase write-through)
4. Update the auth pages (`/auth/sign-in`, `/auth/sign-up`, `/auth/forgot`)
5. Build `web/middleware.ts` for SSR auth gating
6. Wire `/api/account/delete`

Estimated time for that round of work: a couple of hours of coding once your project exists.

## Troubleshooting

- **"new row violates row-level security policy"** when running a query → you're hitting RLS without a valid session. Either sign in first, or use the service role key (server-only).
- **`relation "public.profiles" does not exist`** → migration didn't run. Re-run `0001_initial_schema.sql` in the SQL Editor.
- **Apple Sign In returns "invalid_client"** → the Services ID, key ID, or team ID in Supabase doesn't match the Apple Developer portal. Re-check.
- **Auth emails not arriving** → check Authentication → Logs in Supabase. If it says "smtp failed", the Resend SMTP config above is wrong.

## Cost so far

Supabase Free tier ($0/mo) covers:
- 500MB Postgres database
- 1GB file storage (we'll use this in Phase 3 for photo evidence)
- 50,000 monthly active users
- 200 concurrent realtime connections

Apple Developer account is $99/year. That's the only out-of-pocket cost for Phase 1.

Resend stays free until you cross 3,000 emails/month.
