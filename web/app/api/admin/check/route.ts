import { getAdminUser } from "../../../lib/admin";

/**
 * GET /api/admin/check
 *
 * Tiny "am I an admin?" probe for client components that need to show
 * or hide a UI affordance (the Admin link in DashboardChrome's dropdown).
 * Returns 200 { ok: true } for admins, 403 { ok: false } for everyone
 * else. The client caches the answer in component state — no need to
 * hit this more than once per session.
 *
 * This endpoint does NOT leak the admin allowlist; it only confirms
 * yes/no for the requesting user.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
