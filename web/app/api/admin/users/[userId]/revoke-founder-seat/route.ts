import type { NextRequest } from "next/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { recordAdminAction } from "../../../../../lib/admin-audit";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/revoke-founder-seat
 *
 * Body: { reason: string }   (required — this is the exception path)
 *
 * EXCEPTION to the locked refund policy. Normally founder seats stay
 * claimed forever (see project_admin.md → "Why the founder seat doesn't
 * release on refund"). This endpoint is for fraud / chargeback / TOS
 * violation cases where we DO want to free the seat. Reason is required
 * and stored on the audit row so the deviation is justified in the trail.
 *
 * Side effects:
 *   - founder_seats: user_id → null, claimed_at → null, session_id → null
 *     (the seat goes back into the pool; next paid signup gets it)
 *   - subscriptions: status → 'canceled', founder_seat_number → null
 *   - admin_actions: audit row with reason in metadata
 *
 * NOT performed: a Stripe refund. This endpoint only revokes access; if
 * a refund is also needed, run /api/admin/refund first (or refund in the
 * Stripe dashboard).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REASON = 500;

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-revoke-founder-seat");
  if (gate instanceof Response) return gate;
  const { admin } = gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;
  const userId = userIdOrErr;

  let body: { reason?: unknown };
  try {
    body = (await request.json()) as { reason?: unknown };
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 1 || reason.length > MAX_REASON) {
    return json(
      {
        ok: false,
        error:
          "A written reason is required to revoke a seat (1–500 chars).",
      },
      400,
    );
  }

  const db = createAdminClient();

  const { data: userData } = await db.auth.admin.getUserById(userId);
  const targetEmail = userData.user?.email ?? null;

  const { data: seat } = await db
    .from("founder_seats")
    .select("seat_number")
    .eq("user_id", userId)
    .maybeSingle();
  if (!seat?.seat_number) {
    return json({ ok: false, error: "No founder seat to revoke." }, 404);
  }
  const seatNumber = seat.seat_number;

  // Free the seat.
  const { error: seatErr } = await db
    .from("founder_seats")
    .update({
      user_id: null,
      claimed_at: null,
      stripe_session_id: null,
    })
    .eq("seat_number", seatNumber);
  if (seatErr) {
    console.error("[admin/revoke-founder-seat] seat clear failed:", seatErr);
    return json({ ok: false, error: "Couldn't free the seat." }, 500);
  }

  // Mark subscription canceled. Don't touch Stripe; refund is a separate op.
  const { error: subErr } = await db
    .from("subscriptions")
    .update({
      status: "canceled",
      founder_seat_number: null,
      cancel_at_period_end: false,
    })
    .eq("user_id", userId);
  if (subErr) {
    console.error("[admin/revoke-founder-seat] sub update failed:", subErr);
    // Don't bail — seat is freed. Surface a warning.
    await recordAdminAction(db, {
      adminUserId: admin.userId,
      action: "founder_seat_revoked",
      targetUserId: userId,
      targetEmail,
      metadata: {
        seatNumber,
        reason,
        warning: "subscription update failed",
      },
    });
    return json(
      {
        ok: true,
        seatNumber,
        warning:
          "Seat freed but subscription row didn't update. Fix in SQL.",
      },
      200,
    );
  }

  await recordAdminAction(db, {
    adminUserId: admin.userId,
    action: "founder_seat_revoked",
    targetUserId: userId,
    targetEmail,
    metadata: { seatNumber, reason },
  });

  return json({ ok: true, seatNumber });
}
