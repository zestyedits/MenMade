import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Admin identity.
 *
 * We resolve admin status via an ENV-based allowlist (ADMIN_EMAILS) rather
 * than a `role` column on auth.users. Two reasons:
 *
 *  1. We can't accidentally privilege-escalate a user by tampering with a
 *     row — admin status is a deploy-time secret, not runtime data. A
 *     leaked service-role key can't make someone an admin.
 *  2. The set of admins is small enough (one of us) that the friction of
 *     editing env + redeploying is a feature, not a bug.
 *
 * When the team grows past "two trusted humans" we can graduate this to
 * a roles table + Supabase RLS policy. Until then, keep it boring.
 *
 * Server-only. Never import from a Client Component — the allowlist must
 * not leak into the browser bundle.
 */

function adminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export type AdminUser = { userId: string; email: string };

/**
 * Returns the current admin user, or null if:
 *   - no session
 *   - session email is missing
 *   - email is not in ADMIN_EMAILS
 *
 * Case-insensitive on email match.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const allow = adminAllowlist();
  if (!allow.has(user.email.toLowerCase())) return null;

  return { userId: user.id, email: user.email };
}

/**
 * Hard guard for admin-only server-rendered routes. Throws via
 * `redirect()` on failure (which Next handles as a real redirect).
 * Non-admins are sent to /dashboard — they shouldn't even know /admin
 * exists. proxy.ts already bounces unauthenticated users to sign-in
 * before we get here.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/dashboard");
  }
  return admin;
}

/**
 * Cheap "is this email an admin?" check for joined lists (recent users
 * table flags admins inline). Safe to call inside loops.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminAllowlist().has(email.toLowerCase());
}
