import type { NextRequest } from "next/server";
import { adminGate, extractUserId, json } from "../../_shared";

/**
 * POST /api/admin/users/[userId]/promote
 *
 * Stub. Admin identity is currently env-based (ADMIN_EMAILS in
 * web/app/lib/admin.ts), so promotion can't happen at runtime — it needs
 * an env edit and a redeploy.
 *
 * Returns 501 with a directive message. We're capturing the intent now
 * (the action menu in the admin UI offers it); the actual implementation
 * lands when we migrate to a `user_roles` table. See project_admin.md
 * → "Adding a new admin" for the manual procedure.
 *
 * No admin_actions row is written (no action happened). Rate limit still
 * runs so repeated probing doesn't bypass other admin write budgets.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ userId: string }> },
) {
  const gate = await adminGate(request, "admin-promote");
  if (gate instanceof Response) return gate;

  const userIdOrErr = await extractUserId(ctx);
  if (userIdOrErr instanceof Response) return userIdOrErr;

  return json(
    {
      ok: false,
      error:
        "Promotion not yet supported. Edit ADMIN_EMAILS env var and redeploy.",
    },
    501,
  );
}
