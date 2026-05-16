#!/usr/bin/env node
// Faster API-only smoke test. Skips the browser entirely — uses the Supabase
// admin client to set up a user, hits API routes with Bearer tokens, asserts
// expected behavior. Catches 90% of backend regressions in seconds.
//
// Run: npm run smoke:api
//
// Each route's auth still flows through cookie-bearing createClient() in the
// route handler — but we attach a session cookie manually using the user's
// access_token from a password sign-in.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  adminClient,
  createTestUser,
  deleteByEmail,
  deleteTestUser,
} from "./lib/test-user.mjs";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const STAMP = Date.now().toString(36);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const USER = {
  email: `api-smoke-${STAMP}@menmade.test`,
  password: "TestPass1234!",
  handle: `api${STAMP}`,
  displayName: `API ${STAMP}`,
};

let exitCode = 0;
const cleanup = [];
const checks = [];

function log(stage, msg) {
  console.log(`[${stage}] ${msg}`);
}

function check(name, condition, detail = "") {
  const ok = Boolean(condition);
  checks.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) exitCode = 1;
}

// Sign in via supabase-js to get the project's session cookies. The route
// handlers use @supabase/ssr which expects cookies named `sb-<ref>-auth-token`
// — supabase-js signInWithPassword returns the access_token & refresh_token
// that compose that cookie value.
async function signedInFetcher(email, password) {
  const sb = createSupabaseClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn: ${error.message}`);

  // Extract Supabase project ref from URL (https://<ref>.supabase.co)
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  // @supabase/ssr stores the session as a JSON-encoded array, base64-prefixed.
  const cookieValue =
    "base64-" +
    Buffer.from(
      JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: "bearer",
        user: data.session.user,
      }),
    ).toString("base64");
  const cookie = `sb-${ref}-auth-token=${cookieValue}`;

  return async function (path, init = {}) {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        cookie,
      },
    });
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    return { status: res.status, body };
  };
}

async function main() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  log("setup", `base=${BASE} stamp=${STAMP}`);
  await deleteByEmail(USER.email);
  const user = await createTestUser(USER);
  cleanup.push(user.id);
  log("setup", `user id=${user.id.slice(0, 8)}`);

  // Seed a profile row so /api/chat/messages POST doesn't 409 on "profile missing".
  const admin = adminClient();
  await admin.from("profiles").upsert({
    user_id: user.id,
    handle: USER.handle,
    display_name: USER.displayName,
  });

  // ---------- unauthenticated checks ----------
  log("phase", "unauthenticated 401 sweep");
  for (const path of [
    "/api/squads/me",
    "/api/squads/members?squad=founders-circle",
    "/api/squads/founders-circle",
    "/api/chat/messages?squad=founders-circle",
  ]) {
    const res = await fetch(`${BASE}${path}`);
    const json = await res.json().catch(() => ({}));
    check(`GET ${path} → 401`, res.status === 401 && json.ok === false);
  }
  for (const path of [
    "/api/squads/match",
    "/api/chat/messages",
    "/api/chat/report",
  ]) {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const json = await res.json().catch(() => ({}));
    check(`POST ${path} → 401`, res.status === 401 && json.ok === false);
  }

  // ---------- authenticated flow ----------
  log("phase", "authenticated flow as test user");
  const fetchAs = await signedInFetcher(USER.email, USER.password);

  const me1 = await fetchAs("/api/squads/me");
  check(
    "GET /api/squads/me (before match) → empty",
    me1.status === 200 && me1.body.ok === true && me1.body.squads.length === 0,
    `got ${me1.body.squads?.length} squads`,
  );

  const match = await fetchAs("/api/squads/match", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      focus: ["build"],
      intensity: "steady",
      timezone: "UTC",
    }),
  });
  check(
    "POST /api/squads/match → joined Circle",
    match.status === 200 &&
      match.body.ok === true &&
      match.body.squad?.handle === "founders-circle",
    JSON.stringify(match.body),
  );

  const matchAgain = await fetchAs("/api/squads/match", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ focus: [], intensity: "steady", timezone: "UTC" }),
  });
  check(
    "POST /api/squads/match (idempotent)",
    matchAgain.body.ok === true && matchAgain.body.already_member === true,
    JSON.stringify(matchAgain.body),
  );

  const me2 = await fetchAs("/api/squads/me");
  check(
    "GET /api/squads/me (after match) → 1 squad",
    me2.body.ok === true && me2.body.squads.length === 1,
    JSON.stringify(me2.body.squads?.[0]?.handle),
  );

  const detail = await fetchAs("/api/squads/founders-circle");
  check(
    "GET /api/squads/[slug] → squad + role + roster",
    detail.status === 200 &&
      detail.body.ok === true &&
      detail.body.squad?.handle === "founders-circle" &&
      detail.body.role === "member" &&
      Array.isArray(detail.body.members) &&
      detail.body.members.length >= 1,
    `role=${detail.body.role} members=${detail.body.members?.length}`,
  );

  const detail404 = await fetchAs("/api/squads/no-such-squad");
  check(
    "GET /api/squads/[slug] for unknown → 404",
    detail404.status === 404 && detail404.body.ok === false,
    JSON.stringify(detail404.body),
  );

  const send = await fetchAs("/api/chat/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      squad: "founders-circle",
      body: `api smoke ${STAMP}`,
    }),
  });
  check(
    "POST /api/chat/messages → ok",
    send.body.ok === true && send.body.message?.body === `api smoke ${STAMP}`,
    JSON.stringify(send.body).slice(0, 200),
  );

  const hist = await fetchAs(
    "/api/chat/messages?squad=founders-circle&limit=10",
  );
  check(
    "GET /api/chat/messages → contains our message",
    hist.body.ok === true &&
      hist.body.messages.some((m) => m.body === `api smoke ${STAMP}`),
    `${hist.body.messages?.length} messages`,
  );

  // Hard-block: send a known-slur message. We don't enumerate slurs in source —
  // pick something obscenity's englishDataset definitely catches.
  const block = await fetchAs("/api/chat/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ squad: "founders-circle", body: "you fucking idiot" }),
  });
  check(
    "POST /api/chat/messages slur → hard-block",
    block.body.ok === false && block.body.verdict === "hard-block",
    JSON.stringify(block.body),
  );

  const { count: modCount } = await admin
    .from("mod_actions")
    .select("id", { count: "exact", head: true })
    .eq("target_user_id", user.id)
    .eq("action", "hard_blocked");
  check(
    "mod_actions row written for hard-block",
    (modCount ?? 0) >= 1,
    `count=${modCount}`,
  );

  const sent = send.body.message;
  if (sent?.id) {
    const report = await fetchAs("/api/chat/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId: sent.id, reason: "smoke test" }),
    });
    check(
      "POST /api/chat/report → ok",
      report.body.ok === true,
      JSON.stringify(report.body),
    );
  }

  // ---------- summary ----------
  log("phase", "summary");
  const passed = checks.filter((c) => c.ok).length;
  console.log(`\n${passed}/${checks.length} checks passed`);
}

main()
  .catch((err) => {
    console.error("[fatal]", err.stack ?? err);
    exitCode = 1;
  })
  .finally(async () => {
    log("teardown", "deleting test user");
    for (const id of cleanup) await deleteTestUser(id).catch(() => {});
    process.exit(exitCode);
  });
