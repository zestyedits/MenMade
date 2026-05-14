import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only helpers for writing admin_actions rows and concern_signals
 * rows. Both use a service-role client — DO NOT import from a Client
 * Component, and never pass these helpers down through a server action
 * to client-supplied input without re-validating at the boundary.
 *
 * The helpers are best-effort: they log on failure but never throw,
 * because audit/observability writes must never block the primary
 * operation they're recording. The primary operation has already
 * succeeded by the time we call these.
 */

export type AdminActionKind =
  | "user_suspended"
  | "user_unsuspended"
  | "user_deleted"
  | "user_updated"
  | "password_reset_sent"
  | "founder_seat_granted"
  | "founder_seat_revoked"
  | "refund_issued"
  | "admin_promoted"
  | "admin_demoted";

export type ConcernSignalKind =
  | "payment_failed"
  | "refund_issued"
  | "account_deleted"
  | "rate_limit_hit"
  | "honeypot_tripped"
  | "webhook_delivery_lag"
  | "user_reported"
  | "admin_review_requested"
  | "signup_burst";

export type Severity = "low" | "medium" | "high";

export async function recordAdminAction(
  db: SupabaseClient,
  params: {
    adminUserId: string;
    action: AdminActionKind;
    targetUserId?: string | null;
    targetEmail?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  const { error } = await db.from("admin_actions").insert({
    admin_user_id: params.adminUserId,
    action: params.action,
    target_user_id: params.targetUserId ?? null,
    target_email: params.targetEmail ?? null,
    metadata: params.metadata ?? null,
  });
  if (error) {
    console.error("[admin-audit] recordAdminAction failed:", error, params);
  }
}

export async function recordConcernSignal(
  db: SupabaseClient,
  params: {
    kind: ConcernSignalKind;
    severity: Severity;
    title: string;
    body?: string | null;
    relatedUserId?: string | null;
    relatedEmail?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<void> {
  const { error } = await db.from("concern_signals").insert({
    kind: params.kind,
    severity: params.severity,
    title: params.title,
    body: params.body ?? null,
    related_user_id: params.relatedUserId ?? null,
    related_email: params.relatedEmail ?? null,
    metadata: params.metadata ?? null,
  });
  if (error) {
    console.error("[admin-audit] recordConcernSignal failed:", error, params);
  }
}
