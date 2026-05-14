import type { NextRequest } from "next/server";
import { getAdminUser } from "../../../../lib/admin";
import { getClientIp, rateLimit } from "../../../../lib/rate-limit";
import { createAdminClient } from "../../../../lib/supabase/admin";

/**
 * POST /api/admin/buddy/dismiss
 *
 * Body: { signalId: uuid }
 *
 * Marks a concern_signals row as dismissed. Idempotent — dismissing an
 * already-dismissed signal returns 200 (the UI may race against itself).
 *
 * No admin_actions audit entry — dismissals are housekeeping, not
 * material moderation actions. If we later need a trail (e.g. to confirm
 * an admin SAW a signal before something escalated), revisit.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response(JSON.stringify({ ok: false, error: "Not authorized." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  const ip = getClientIp(request);
  const verdict = rateLimit({
    bucketKey: "admin-buddy-dismiss",
    ip,
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (!verdict.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: "Slow down." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "Retry-After": String(verdict.retryAfterSeconds),
        },
      },
    );
  }

  let body: { signalId?: unknown };
  try {
    body = (await request.json()) as { signalId?: unknown };
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  const signalId =
    typeof body.signalId === "string" ? body.signalId : "";
  if (!UUID_RE.test(signalId)) {
    return Response.json(
      { ok: false, error: "Malformed signal id." },
      { status: 400 },
    );
  }

  const db = createAdminClient();
  const { error } = await db
    .from("concern_signals")
    .update({
      dismissed_at: new Date().toISOString(),
      dismissed_by: admin.userId,
    })
    .eq("id", signalId)
    .is("dismissed_at", null);

  if (error) {
    console.error("[admin/buddy/dismiss] update failed:", error);
    return Response.json(
      { ok: false, error: "Couldn't dismiss." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
