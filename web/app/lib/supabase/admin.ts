import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES Row-Level Security.
 *
 * Use only from server-side code that absolutely needs to escape RLS —
 * webhook handlers (Stripe, Apple, Google), account deletion, system
 * cleanup, scheduled jobs. Never import from a Client Component, never
 * pass results back to the browser without sanitization.
 *
 * Throws at import time if the env var is missing so we fail fast at
 * boot rather than mysteriously 500ing on the first webhook.
 */
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SERVICE_ROLE_KEY) {
  // Don't crash dev when the env var is missing — just warn. Real code
  // paths that import this should still error when they try to use it.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required in production. Set it in your env.",
    );
  } else {
    console.warn(
      "[supabase/admin] SUPABASE_SERVICE_ROLE_KEY not set — admin client will throw on use.",
    );
  }
}

export function createAdminClient() {
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL) {
    throw new Error(
      "Supabase admin client called without SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL set.",
    );
  }
  return createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
