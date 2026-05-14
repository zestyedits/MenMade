"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "../components/AuthGuard";
import { DashboardChrome } from "../dashboard/DashboardChrome";

/**
 * Layout for /admin. Wraps in the same DashboardChrome the rest of the
 * authenticated app uses so admins keep their navbar + sign-out menu.
 *
 * Admin-allowlist gating is NOT performed here — this is a client
 * component, it can't read ADMIN_EMAILS. Each page-level Server Component
 * under /admin must call `requireAdmin()` to bounce non-admin signed-in
 * users back to /dashboard.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {(session) => (
        <DashboardChrome session={session}>{children}</DashboardChrome>
      )}
    </AuthGuard>
  );
}
