// Test-user helpers: create pre-confirmed users via the Supabase admin API
// (bypassing the email-click confirmation step), and clean them up at
// teardown. Reads env vars from the same .env.local the dev server uses.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../../.env.local");

function loadEnv() {
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      const [, k, v] = m;
      if (!process.env[k]) process.env[k] = v.replace(/^["']|["']$/g, "");
    }
  } catch {
    // optional in CI
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "[test-user] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export function adminClient() {
  return admin;
}

export async function createTestUser({ email, password, handle, displayName }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { handle, display_name: displayName },
  });
  if (error) throw new Error(`createUser: ${error.message}`);
  return data.user;
}

export async function deleteTestUser(userId) {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && !/not[\s_-]?found/i.test(error.message)) {
    throw new Error(`deleteUser: ${error.message}`);
  }
}

export async function deleteByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw new Error(`listUsers: ${error.message}`);
  const match = data.users.find((u) => u.email === email);
  if (match) await deleteTestUser(match.id);
}
