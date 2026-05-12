import { createClient } from "../../lib/supabase/server";

/**
 * Health check. Pings Supabase via a cheap query so we know:
 *   - env vars are set
 *   - the project URL is reachable
 *   - RLS isn't blocking the world-readable handle_reservations table
 *
 * Public-safe response only. Error details are logged server-side; the
 * response body never echoes DB error strings or migration filenames
 * (we don't tell attackers which migrations exist).
 *
 * Use the `HEALTHZ_VERBOSE_TOKEN` env var to get the detailed response
 * by passing `?token=<value>` — useful for Vercel uptime probes that need
 * structured output.
 */
const VERBOSE_TOKEN = process.env.HEALTHZ_VERBOSE_TOKEN ?? "";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const verbose =
    VERBOSE_TOKEN.length > 0 && url.searchParams.get("token") === VERBOSE_TOKEN;

  try {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("handle_reservations")
      .select("handle", { count: "exact", head: true });

    if (error) {
      console.error("[healthz] supabase query failed:", error.message);
      return Response.json(
        verbose
          ? { ok: false, stage: "supabase-query", error: error.message }
          : { ok: false },
        { status: 503 },
      );
    }

    return Response.json(
      verbose
        ? {
            ok: true,
            supabase: "reachable",
            handle_reservations_count: count,
            duration_ms: Date.now() - startedAt,
          }
        : { ok: true },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[healthz] client init failed:", message);
    return Response.json(
      verbose ? { ok: false, stage: "client-init", error: message } : { ok: false },
      { status: 503 },
    );
  }
}
