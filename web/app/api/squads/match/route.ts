import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";
import { recordConcernSignal } from "../../../lib/admin-audit";

/**
 * POST /api/squads/match
 *
 * Body: { focus: FocusArea[], intensity: Intensity, timezone: string }
 *
 * Called from onboarding finish() when squadStyle === 'matched'. Auto-joins
 * the user to the singleton Founders Circle. We accept focus/intensity/tz
 * in the body rather than reading from preferences because the onboarding
 * store-sync layer is debounced 400ms — the row may not be on the server
 * yet at the moment finish() fires this request.
 *
 * Idempotent: re-calling for an already-joined user is a no-op success.
 *
 * Graduation logic (spinning off a focused 5-man squad) lands in Phase 3b;
 * for now everyone stays in the Circle.
 */

const VALID_FOCUS = new Set([
  "build",
  "move",
  "make",
  "master",
  "mend",
  "mark",
]);
const VALID_INTENSITY = new Set(["light", "steady", "heavy", "brutal"]);
const MAX_BODY_BYTES = 1024;

type Body = { focus?: unknown; intensity?: unknown; timezone?: unknown };

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
    bucketKey: "squads:match:" + user.id,
    ip,
    limit: 10,
    windowMs: 5 * 60_000,
  });
  if (!limit.ok) {
    if (limit.firstViolation) {
      try {
        await recordConcernSignal(createAdminClient(), {
          kind: "rate_limit_hit",
          severity: "low",
          title: "Squad-match retry storm",
          body: `User ${user.id} hit /api/squads/match >10 times in 5 min.`,
          relatedUserId: user.id,
          relatedEmail: user.email ?? null,
          metadata: { ip, bucket: "squads:match" },
        });
      } catch (err) {
        console.warn("[squads/match] rate-limit signal write failed:", err);
      }
    }
    return NextResponse.json(
      { ok: false, error: "Too many attempts." },
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

  const focus = Array.isArray(body.focus)
    ? body.focus
        .slice(0, 6)
        .filter((f): f is string => typeof f === "string" && VALID_FOCUS.has(f))
    : [];
  const intensity =
    typeof body.intensity === "string" && VALID_INTENSITY.has(body.intensity)
      ? body.intensity
      : null;
  const timezone =
    typeof body.timezone === "string" && body.timezone.length <= 64
      ? body.timezone
      : null;

  const admin = createAdminClient();

  const { data: circle, error: circleErr } = await admin
    .from("squads")
    .select("id, handle")
    .eq("kind", "founders_circle")
    .maybeSingle();

  if (circleErr || !circle) {
    console.error("[squads/match] Founders Circle missing:", circleErr);
    return NextResponse.json(
      { ok: false, error: "Squad infra not initialised." },
      { status: 503 },
    );
  }

  const { data: existing } = await admin
    .from("squad_members")
    .select("squad_id")
    .eq("squad_id", circle.id)
    .eq("user_id", user.id)
    .is("left_at", null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      ok: true,
      squad: { handle: circle.handle },
      already_member: true,
    });
  }

  const { error: insertErr } = await admin.from("squad_members").insert({
    squad_id: circle.id,
    user_id: user.id,
    role: "member",
  });

  if (insertErr) {
    console.error("[squads/match] join failed:", insertErr);
    return NextResponse.json(
      { ok: false, error: "Couldn't join squad. Try again shortly." },
      { status: 502 },
    );
  }

  // Body fields aren't persisted yet — graduation (Phase 3b) will read them
  // from the preferences table. Keeping the params in the contract now so
  // the client doesn't need to change shape when graduation lands.
  void focus;
  void intensity;
  void timezone;

  return NextResponse.json({
    ok: true,
    squad: { handle: circle.handle },
  });
}
