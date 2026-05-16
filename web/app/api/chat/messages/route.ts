import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { classifyMessage } from "../../../lib/moderation/classify";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";
import { recordConcernSignal } from "../../../lib/admin-audit";

/**
 * GET  /api/chat/messages?squad=<handle>&before=<iso>&since=<iso>&limit=50
 *   Paginated history (use `before`) or incremental tail (use `since`, used
 *   by the short-poll loop that replaces Realtime until Phase 3b ships the
 *   private-channel upgrade). Server filters out hard_blocked rows and
 *   messages whose author_user_id is in the requester's block list.
 *
 * POST /api/chat/messages
 *   Body: { squad: <handle>, body: string, stampId?: string }
 *   Runs the moderation pipeline before insert. On hard-block, returns
 *   `{ ok: false, verdict: 'hard-block', reason }` and writes a mod_actions
 *   row. On success, returns the canonical row so the client can swap its
 *   optimistic insert for the server-confirmed one.
 */

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MAX_BODY_BYTES = 4096;

async function getSquadByHandle(handle: string) {
  const admin = createAdminClient();
  return admin.from("squads").select("id, handle").eq("handle", handle).maybeSingle();
}

async function getMembership(squadId: string, userId: string) {
  const admin = createAdminClient();
  return admin
    .from("squad_members")
    .select("squad_id, role")
    .eq("squad_id", squadId)
    .eq("user_id", userId)
    .is("left_at", null)
    .maybeSingle();
}

export async function GET(request: NextRequest) {
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

  const params = request.nextUrl.searchParams;
  const handle = params.get("squad");
  if (!handle) {
    return NextResponse.json(
      { ok: false, error: "Missing squad handle." },
      { status: 400 },
    );
  }

  const before = params.get("before");
  const since = params.get("since");
  const limitRaw = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const { data: squad } = await getSquadByHandle(handle);
  if (!squad) {
    return NextResponse.json(
      { ok: false, error: "Squad not found." },
      { status: 404 },
    );
  }

  const { data: membership } = await getMembership(squad.id, user.id);
  if (!membership) {
    return NextResponse.json(
      { ok: false, error: "Not a member." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Per-user block list keyed on user_id (not handle) so rename doesn't
  // bypass and a re-claimed handle doesn't ghost-block an unrelated user.
  const { data: blockedRows } = await admin
    .from("blocked_handles")
    .select("blocked_user_id")
    .eq("user_id", user.id)
    .not("blocked_user_id", "is", null);
  const blockedUserIds = (blockedRows ?? [])
    .map((r) => r.blocked_user_id)
    .filter((v): v is string => typeof v === "string");

  let query = admin
    .from("messages")
    .select(
      "id, squad_id, author_user_id, author_handle, author_name, body, reactions, stamp_id, soft_flagged, sent_at",
    )
    .eq("squad_id", squad.id)
    .eq("hard_blocked", false)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("sent_at", before);
  if (since) query = query.gt("sent_at", since);
  if (blockedUserIds.length > 0) {
    // PostgREST .in() escapes inputs internally — safer than hand-quoting.
    query = query.not("author_user_id", "in", `(${blockedUserIds.join(",")})`);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("[chat/messages GET] query failed:", error);
    return NextResponse.json(
      { ok: false, error: "Couldn't load messages." },
      { status: 502 },
    );
  }

  const messages = (rows ?? []).map((m) => ({
    id: m.id,
    authorHandle: m.author_handle,
    authorName: m.author_name,
    body: m.body,
    sentAtIso: m.sent_at,
    reactions: m.reactions as Record<string, number>,
    stampId: m.stamp_id ?? undefined,
    softFlagged: m.soft_flagged,
  }));

  return NextResponse.json({ ok: true, messages });
}

type PostBody = { squad?: unknown; body?: unknown; stampId?: unknown };

export async function POST(request: NextRequest) {
  // Content-length gate before we parse anything — defends the JSON
  // parser + moderation pipeline from oversized payloads.
  const declaredLen = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (declaredLen > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Message too large." },
      { status: 413 },
    );
  }

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

  // Per-user route-level rate limit. The in-process budget inside
  // classifyMessage() guards moderation cost; this guards the route's DB
  // hits and JSON parse before classification runs.
  const ip = getClientIp(request);
  const limit = rateLimit({
    bucketKey: "chat:send:" + user.id,
    ip,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    if (limit.firstViolation) {
      try {
        await recordConcernSignal(createAdminClient(), {
          kind: "rate_limit_hit",
          severity: "medium",
          title: "Chat send rate limit hit",
          body: `User ${user.id} exceeded 30 messages / minute — likely spam or scripted client.`,
          relatedUserId: user.id,
          relatedEmail: user.email ?? null,
          metadata: { ip, bucket: "chat:send" },
        });
      } catch (err) {
        console.warn("[chat/messages] rate-limit signal write failed:", err);
      }
    }
    return NextResponse.json(
      { ok: false, error: `Slow down. Try again in ${limit.retryAfterSeconds}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  // Read body as text first so we can enforce a hard byte cap even when
  // Content-Length is absent or wrong (e.g. chunked transfer).
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Message too large." },
      { status: 413 },
    );
  }

  let body: PostBody;
  try {
    body = JSON.parse(raw) as PostBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON." },
      { status: 400 },
    );
  }

  const handle = typeof body.squad === "string" ? body.squad : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  const stampId =
    typeof body.stampId === "string" && body.stampId.length <= 40
      ? body.stampId
      : null;

  if (!handle || !text || text.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid fields." },
      { status: 400 },
    );
  }

  const { data: squad } = await getSquadByHandle(handle);
  if (!squad) {
    return NextResponse.json(
      { ok: false, error: "Squad not found." },
      { status: 404 },
    );
  }

  const { data: membership } = await getMembership(squad.id, user.id);
  if (!membership) {
    return NextResponse.json(
      { ok: false, error: "Not a member." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();

  // Fetch the author's profile snapshot. We denormalize handle + display_name
  // onto the message so history stays readable if the author later renames.
  const { data: profile } = await admin
    .from("profiles")
    .select("handle, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: "Profile missing — finish onboarding first." },
      { status: 409 },
    );
  }

  const verdict = await classifyMessage(text, {
    userId: user.id,
    squadId: squad.id,
    squadHandle: squad.handle,
  });

  if (verdict.verdict === "hard-block") {
    return NextResponse.json({
      ok: false,
      verdict: "hard-block",
      reason: verdict.reason,
    });
  }

  const { data: inserted, error: insertErr } = await admin
    .from("messages")
    .insert({
      squad_id: squad.id,
      author_user_id: user.id,
      author_handle: profile.handle,
      author_name: profile.display_name,
      body: text,
      reactions: {},
      stamp_id: stampId,
      soft_flagged: verdict.verdict === "soft-warn",
      hard_blocked: false,
    })
    .select(
      "id, squad_id, author_user_id, author_handle, author_name, body, reactions, stamp_id, soft_flagged, sent_at",
    )
    .single();

  if (insertErr || !inserted) {
    console.error("[chat/messages POST] insert failed:", insertErr);
    return NextResponse.json(
      { ok: false, error: "Couldn't send message." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    verdict: verdict.verdict,
    message: {
      id: inserted.id,
      authorHandle: inserted.author_handle,
      authorName: inserted.author_name,
      body: inserted.body,
      sentAtIso: inserted.sent_at,
      reactions: inserted.reactions as Record<string, number>,
      stampId: inserted.stamp_id ?? undefined,
      softFlagged: inserted.soft_flagged,
    },
  });
}
