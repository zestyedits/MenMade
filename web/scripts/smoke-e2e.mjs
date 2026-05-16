#!/usr/bin/env node
// End-to-end smoke test for the Phase 3a chat surface.
//
// Spins two pre-confirmed test users via the Supabase admin API (no email
// click needed), drives them through onboarding in headless Chromium, has
// User A send a message, and verifies the row lands in `messages` and gets
// received by User B's session. Tears down both users at exit.
//
// Run with: npm run smoke:e2e
// Requires: dev server running on http://localhost:3000 + .env.local with
//   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set.

import { chromium } from "playwright";
import {
  adminClient,
  createTestUser,
  deleteByEmail,
  deleteTestUser,
} from "./lib/test-user.mjs";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const STAMP = Date.now().toString(36);
const USER_A = {
  email: `e2e-a-${STAMP}@menmade.test`,
  password: "TestPass1234!",
  handle: `a-${STAMP}`,
  displayName: `A ${STAMP}`,
};
const USER_B = {
  email: `e2e-b-${STAMP}@menmade.test`,
  password: "TestPass1234!",
  handle: `b-${STAMP}`,
  displayName: `B ${STAMP}`,
};
// Stay ASCII only — pressSequentially feeds key events one char at a time
// and some Unicode glyphs (em-dash etc.) don't survive the keyboard channel.
const MESSAGE = `e2e msg ${STAMP} squad chat works`;

let exitCode = 0;
const cleanupIds = [];
const livePages = new Map();

function log(stage, msg) {
  console.log(`[${stage}] ${msg}`);
}

async function fail(stage, err) {
  console.error(`[${stage}] FAIL: ${err?.stack ?? err}`);
  for (const [name, page] of livePages.entries()) {
    try {
      const url = page.url();
      const path = `/tmp/smoke-e2e-${name}-${STAMP}.png`;
      await page.screenshot({ path, fullPage: true });
      console.error(`[diag] ${name} at ${url} → screenshot ${path}`);
      const bodyText = await page
        .locator("body")
        .innerText({ timeout: 2_000 })
        .catch(() => "<body unreadable>");
      console.error(
        `[diag] ${name} body text (first 400 chars):\n${bodyText.slice(0, 400)}`,
      );
    } catch (e) {
      console.error(`[diag] couldn't capture ${name}:`, e.message);
    }
  }
  exitCode = 1;
}

async function ensureCleanSlate() {
  log("setup", `purging any prior users with our test emails`);
  await deleteByEmail(USER_A.email);
  await deleteByEmail(USER_B.email);
}

async function signIn(page, user) {
  await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "domcontentloaded" });
  // React controlled inputs occasionally drop a Playwright .fill() — the
  // DOM value updates but React's setState callback never fires, so the
  // submit handler reads "" and rejects. Click → press → blur pattern
  // makes the events look like real keystrokes which React always picks
  // up. (Verified: with .fill() alone, "REQUIRED." showed on both fields
  // after submit on the second user's context — see commit notes.)
  const emailInput = page.getByLabel("Email");
  const passwordInput = page.getByLabel("Password");
  await emailInput.click();
  await emailInput.pressSequentially(user.email, { delay: 8 });
  await passwordInput.click();
  await passwordInput.pressSequentially(user.password, { delay: 8 });
  const submit = page.getByRole("button", { name: /^sign in$/i });
  await submit.waitFor({ state: "visible", timeout: 30_000 });
  await Promise.all([
    page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 90_000 }),
    submit.click(),
  ]);
}

async function completeOnboarding(page, user) {
  // Step 1: focus — pick "Build"
  await page.waitForURL(/\/onboarding/, { timeout: 60_000 });
  await page.getByRole("button", { name: /^build/i }).click();
  await page.getByRole("button", { name: /^next$/i }).click();

  // Step 2: intensity — default 'steady' + 6 days/week already selected
  await page.getByRole("button", { name: /^next$/i }).click();

  // Step 3: squad style — matched is default; just advance
  await page.getByRole("button", { name: /^next$/i }).click();

  // Step 4: identity — same React-controlled-input caveat as signIn().
  const nameInput = page.getByLabel("Display name");
  await nameInput.click();
  await nameInput.pressSequentially(user.displayName, { delay: 8 });
  const handleInput = page.getByLabel("Handle");
  await handleInput.click();
  await handleInput.pressSequentially(user.handle, { delay: 8 });
  await Promise.all([
    page.waitForURL(/\/dashboard/, { timeout: 60_000 }),
    page.getByRole("button", { name: /find my squad/i }).click(),
  ]);
}

async function landOnChat(page) {
  await page.goto(`${BASE}/chat?s=founders-circle`, {
    waitUntil: "domcontentloaded",
  });
  // The COC modal mounts via useEffect after first paint — wait for it
  // to settle one way or the other, then dismiss if present. Force-click
  // because the modal occasionally re-paints during framer-motion exit
  // and steals hit-test points.
  const cocAccept = page.getByRole("button", { name: /got it/i });
  await cocAccept
    .waitFor({ state: "visible", timeout: 8_000 })
    .catch(() => {});
  if (await cocAccept.count()) {
    await cocAccept.first().click({ force: true, timeout: 5_000 }).catch(() => {});
    // Wait for the modal to actually leave the DOM before continuing.
    await cocAccept.waitFor({ state: "detached", timeout: 5_000 }).catch(() => {});
  }
  // Wait until the composer is mounted — squads list + active row both
  // need to resolve before the stream half renders.
  await page
    .getByLabel("Message")
    .waitFor({ state: "visible", timeout: 30_000 });
}

async function sendMessage(page, body) {
  const composer = page.getByLabel("Message");
  await composer.waitFor({ state: "visible", timeout: 30_000 });
  // React-controlled textarea — same caveat as signIn(). pressSequentially
  // fires real key events so React's onChange picks them up.
  await composer.click();
  await composer.pressSequentially(body, { delay: 4 });
  // Submit by pressing Enter (handleSubmit also lives on the form, and
  // Enter is what a real user would do). Avoids any send-button overlay
  // weirdness from the picker popover.
  await composer.press("Enter");
  // Optimistic render — the message should appear immediately.
  await page.getByText(body, { exact: false }).waitFor({ timeout: 15_000 });
}

async function verifyDb({ userId, body }) {
  const admin = adminClient();
  // sendMessage returns as soon as the optimistic row renders; the
  // server POST is still in flight. Poll for up to 5s for the canonical
  // row.
  const deadline = Date.now() + 5_000;
  let data = null;
  while (Date.now() < deadline) {
    const res = await admin
      .from("messages")
      .select("id, author_user_id, body, soft_flagged, hard_blocked")
      .ilike("body", `%${STAMP}%`)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (res.error) throw new Error(`messages query: ${res.error.message}`);
    if (res.data) {
      data = res.data;
      break;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!data) throw new Error("message row not found in DB after 5s");
  if (data.author_user_id !== userId)
    throw new Error(`author mismatch: ${data.author_user_id} !== ${userId}`);
  if (data.hard_blocked) throw new Error("message was hard-blocked");
  log("verify", `db row id=${data.id} body="${data.body}" soft_flagged=${data.soft_flagged}`);
  return data;
}

async function verifyMembership(userId, squadHandle) {
  const admin = adminClient();
  const { data: squad } = await admin
    .from("squads")
    .select("id")
    .eq("handle", squadHandle)
    .single();
  const { data: member, error } = await admin
    .from("squad_members")
    .select("user_id, role")
    .eq("squad_id", squad.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`squad_members query: ${error.message}`);
  if (!member) throw new Error(`${userId} not a member of ${squadHandle}`);
  log("verify", `membership ok role=${member.role}`);
}

async function verifyRealtimeReceive(pageB, body) {
  // User B has /chat already loaded; the realtime subscription should
  // surface the new message without a refresh. Generous 10s window.
  await pageB.getByText(body, { exact: false }).waitFor({ timeout: 10_000 });
  log("verify", "user B saw the message via realtime");
}

async function main() {
  log("setup", `base=${BASE} stamp=${STAMP}`);
  await ensureCleanSlate();

  const userA = await createTestUser(USER_A);
  const userB = await createTestUser(USER_B);
  cleanupIds.push(userA.id, userB.id);
  log("setup", `created users a=${userA.id.slice(0, 8)} b=${userB.id.slice(0, 8)}`);

  const browser = await chromium.launch({ headless: true });
  try {
    // === User A: sign in, onboard, land in chat, send message ===
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    livePages.set("user-a", pageA);
    await signIn(pageA, USER_A);
    log("user-a", "signed in");

    if (new URL(pageA.url()).pathname.startsWith("/onboarding")) {
      await completeOnboarding(pageA, USER_A);
      log("user-a", "onboarding complete");
    }

    await verifyMembership(userA.id, "founders-circle");

    // === User B: sign in + onboard in parallel so /chat has 2 members ===
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    livePages.set("user-b", pageB);
    await signIn(pageB, USER_B);
    if (new URL(pageB.url()).pathname.startsWith("/onboarding")) {
      await completeOnboarding(pageB, USER_B);
    }
    await verifyMembership(userB.id, "founders-circle");
    await landOnChat(pageB);
    log("user-b", "watching chat");

    // === Send + verify ===
    await landOnChat(pageA);
    await sendMessage(pageA, MESSAGE);
    log("user-a", "message sent (optimistic)");

    await verifyDb({ userId: userA.id, body: MESSAGE });
    await verifyRealtimeReceive(pageB, MESSAGE);

    log("done", "all checks passed");
  } catch (err) {
    await fail("e2e", err);
  } finally {
    await browser.close();
  }
}

main()
  .catch((err) => fail("main", err))
  .finally(async () => {
    log("teardown", "deleting test users");
    for (const id of cleanupIds) await deleteTestUser(id).catch(() => {});
    process.exit(exitCode);
  });
