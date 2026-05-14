import type { NextRequest } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../../lib/admin-audit";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/grant-founder-seat
 *
 * Body: { note?: string }
 *
 * Manually grants a Founder's Pass seat to the target user (no money
 * changes hands). Used for comp / make-good / contest winners.
 *
 * Atomicity: we reuse the same SELECT ... FOR UPDATE SKIP LOCKED RPC the
 * paid checkout flow uses (claim_next_founder_seat) so a manual grant
 * can race against a paying signup without double-claiming the seat.
 *
 * Side effects:
 *   - founder_seats: lowest unclaimed seat → user_id, claimed_at
 *   - subscriptions: upsert { plan='founder', status='active' }
 *   - admin_actions: audit row
 *
 * Pre-condition: target user must not already hold a founder seat (we
 * don't double-claim — return 409). If their subscription row is a
 * lapsed founder, we'll overwrite back to active. The seat stays the
 * same; we don't reshuffle seat numbers.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-grant-founder-seat");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  let body: { note?: unknown } = {};
  try {
    body = (await request.json().catch(() => ({}))) as { note?: unknown };
  } catch {
    body = {};
  }
  const note =
    typeof body.note === "string" && body.note.trim().length > 0
      ? body.note.trim().slice(0, 500)
      : null;

  const db = createAdminClient();

  // Confirm the user exists; capture email for audit.
  const { data: userData } = await db.auth.admin.getUserById(userId);
  if (!userData.user) {
    return json({ ok: false, error: "User not found." }, 404);
  }
  const targetEmail = userData.user.email ?? null;

  // Already a founder? Don't double-claim.
  const { data: existingSeat } = await db
    .from("founder_seats")
    .select("seat_number")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingSeat?.seat_number) {
    return json(
      {
        ok: false,
        error: `Already holds seat ${String(existingSeat.seat_number).padStart(3, "0")}.`,
      },
      409,
    );
  }

  // Atomic seat reservation via the existing RPC.
  const { data: seatRpc, error: rpcErr } = await db.rpc(
    "claim_next_founder_seat",
    { p_user_id: userId },
  );
  if (rpcErr) {
    console.error("[admin/grant-founder-seat] RPC failed:", rpcErr);
    return json({ ok: false, error: "Couldn't reserve a seat." }, 500);
  }
  const seatNumber = typeof seatRpc === "number" ? seatRpc : null;
  if (seatNumber === null) {
    return json(
      { ok: false, error: "All 500 seats are claimed. None to grant." },
      409,
    );
  }

  // Finalize the seat: drop the pending placeholder and tie it to the user.
  // We use a synthetic session id ("admin-grant:<adminId>:<ts>") so the
  // origin of the claim is greppable, distinct from paid Stripe sessions.
  const syntheticSessionId = `admin-grant:${admin.userId}:${Date.now()}`;
  const nowIso = new Date().toISOString();
  const { error: seatErr } = await db
    .from("founder_seats")
    .update({
      user_id: userId,
      claimed_at: nowIso,
      stripe_session_id: syntheticSessionId,
    })
    .eq("seat_number", seatNumber);

  if (seatErr) {
    console.error("[admin/grant-founder-seat] seat finalize failed:", seatErr);
    return json({ ok: false, error: "Couldn't finalize the seat." }, 500);
  }

  // Upsert subscription row to founder/active.
  const { error: subErr } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "founder",
      status: "active",
      founder_seat_number: seatNumber,
      started_at: nowIso,
      current_period_end: null,
      cancel_at_period_end: false,
      // Synthetic markers — distinguish from paid rows in queries/audits.
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_session_id: syntheticSessionId,
    },
    { onConflict: "user_id" },
  );
  if (subErr) {
    console.error(
      "[admin/grant-founder-seat] subscription upsert failed:",
      subErr,
    );
    // Don't bail — the seat is granted. Surface a partial-success warning.
    await recordAdminAction(db, {
      adminUserId: admin.userId,
      action: "founder_seat_granted",
      targetUserId: userId,
      targetEmail,
      metadata: {
        seatNumber,
        note,
        synthetic: true,
        warning: "subscription upsert failed",
      },
    });
    return json(
      {
        ok: true,
        seatNumber,
        warning:
          "Seat claimed but subscription row didn't update. Re-run grant or fix in SQL.",
      },
      200,
    );
  }

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "founder_seat_granted",
    targetUserId: userId,
    targetEmail,
    metadata: { seatNumber, note, synthetic: true },
  });

  return json({ ok: true, seatNumber });
}
