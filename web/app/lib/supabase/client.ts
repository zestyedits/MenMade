"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Use this from Client Components when
 * you need to read or write data on behalf of the signed-in user.
 *
 * RLS enforces "you can only touch your own rows" at the database
 * layer, so it's safe to call from the browser with the anon key —
 * a malicious user can't escalate by tampering with the request.
 *
 * The singleton wrapper prevents multiple GoTrueClient instances from
 * warring over cookies / localStorage in the same tab.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
