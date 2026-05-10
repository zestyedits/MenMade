"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "../components/AuthGuard";
import { DashboardChrome } from "../dashboard/DashboardChrome";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {(session) => (
        <DashboardChrome session={session}>{children}</DashboardChrome>
      )}
    </AuthGuard>
  );
}
