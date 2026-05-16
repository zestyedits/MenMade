import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";
import { recordConcernSignal } from "../../../lib/admin-audit";

/**
 * POST /api/chat/report
 *
 * Body: { messageId: string, reason?: string }
 *
 * Insert is gated on the reporter being a member of the message's squad.
 * Reports are immutable; once filed they live in the audit trail. The
 * accompanying mod_actions row makes the report visible to the global
 * moderation queue without needing a separate join. The 0008 migration
 * adds a unique index on (reporter_user_id, message_id) so a duplicate
 * report from the same user is a no-op.
 */

const MAX_BODY_BYTES = 2048;

type Body = { messageId?: unknown; reason?: unknown };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Sign in first." },
      { status: 401 },
    );
  }

  const ip = getClientIp(request);
  const limit = rateLimit({
    bucketKey: "chat:report:" + user.id,
    ip,
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    if (limit.firstViolation) {
      try {
        await recordConcernSignal(createAdminClient(), {
          kind: "rate_limit_hit",
          severity: "medium",
          title: "Report flood from one user",
          body: `User ${user.id} filed >20 reports in 60s — possible weaponized reporting.`,
          relatedUserId: user.id,
          relatedEmail: user.email ?? null,
          metadata: { ip, bucket: "chat:report" },
        });
      } catch (err) {
        console.warn("[chat/report] rate-limit signal write failed:", err);
      }
    }
    return NextResponse.json(
      { ok: false, error: "Too many reports. Slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Payload too large." },
      { status: 413 },
    );
  }

  let body: Body;
  try {
    body = JSON.parse(raw) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  const messageId = typeof body.messageId === "string" ? body.messageId : "";
  const reason =
    typeof body.reason === "string" && body.reason.length <= 500
      ? body.reason.trim() || null
      : null;

  if (!messageId) {
    return NextResponse.json(
      { ok: false, error: "Missing messageId." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: message } = await admin
    .from("messages")
    .select("id, squad_id, author_user_id, body")
    .eq("id", messageId)
    .maybeSingle();

  if (!message) {
    return NextResponse.json(
      { ok: false, error: "Message not found." },
      { status: 404 },
    );
  }

  const { data: membership } = await admin
    .from("squad_members")
    .select("squad_id")
    .eq("squad_id", message.squad_id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { ok: false, error: "Not a member of that squad." },
      { status: 403 },
    );
  }

  const { error: reportErr } = await admin.from("reports").insert({
    reporter_user_id: user.id,
    message_id: message.id,
    squad_id: message.squad_id,
    reason,
  });

  // 0008 migration adds a unique (reporter, message) index. A duplicate
  // surfaces as Postgres 23505 — treat as success so the client gets a
  // clean ack and we don't spam mod_actions.
  if (reportErr && reportErr.code !== "23505") {
    console.error("[chat/report] insert failed code=", reportErr.code);
    return NextResponse.json(
      { ok: false, error: "Couldn't file report." },
      { status: 502 },
    );
  }
  const duplicate = reportErr?.code === "23505";

  if (!duplicate) {
    await admin.from("mod_actions").insert({
      action: "reported",
      target_user_id: message.author_user_id,
      squad_id: message.squad_id,
      message_id: message.id,
      body_excerpt: message.body.slice(0, 200),
      metadata: { reporter_user_id: user.id, reason },
    });
  }

  return NextResponse.json({ ok: true, duplicate });
}
