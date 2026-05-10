"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "../components/AuthGuard";
import { DashboardChrome } from "./DashboardChrome";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {(session) => (
        <DashboardChrome session={session}>{children}</DashboardChrome>
      )}
    </AuthGuard>
  );
}
