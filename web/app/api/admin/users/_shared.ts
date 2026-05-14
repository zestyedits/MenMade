import type { NextRequest } from "next/server";
import { getAdminUser, type AdminUser } from "../../../lib/admin";
import { getClientIp, rateLimit } from "../../../lib/rate-limit";

/**
 * Shared utilities for admin user-action routes.
 *
 * Every route under /api/admin/users/[userId]/* needs the same four
 * preconditions: admin auth, rate limit, JSON parsing (where applicable),
 * and a well-formed userId. Centralizing keeps each route file small and
 * the policy easy to audit in one place.
 */

export const UUID_RE = /^[0-9a-f-]{36}$/i;

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Verify the caller is an admin and not rate-limited. Returns the admin
 * user on success, or a Response to short-circuit on failure. Callers do:
 *
 *   const gate = await adminGate(request, "admin-suspend");
 *   if (gate instanceof Response) return gate;
 *   const { admin } = gate;
 */
export async function adminGate(
  request: NextRequest,
  bucketKey: string,
): Promise<{ admin: AdminUser } | Response> {
  const admin = await getAdminUser();
  if (!admin) {
    return json({ ok: false, error: "Not authorized." }, 403);
  }
  const ip = getClientIp(request);
  // 5/min is more than enough — admin shouldn't make a hundred changes/sec.
  const verdict = rateLimit({
    bucketKey,
    ip,
    limit: 5,
    windowMs: 60 * 1000,
  });
  if (!verdict.ok) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Slow down. Too many admin actions from this address.",
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "Retry-After": String(verdict.retryAfterSeconds),
        },
      },
    );
  }
  return { admin };
}

/**
 * Extract and validate the userId param from a dynamic route context.
 * Returns the userId on success, or a 400 Response on a malformed path.
 *
 * Next 16 ships RouteContext<...> typings via generated types at build
 * time, but they're not available during dev for newly-created routes
 * until next typegen runs. Use a structural type instead.
 */
export async function extractUserId(
  ctx: { params: Promise<{ userId: string }> },
): Promise<string | Response> {
  const { userId } = await ctx.params;
  if (!UUID_RE.test(userId)) {
    return json({ ok: false, error: "Malformed user id." }, 400);
  }
  return userId;
}
