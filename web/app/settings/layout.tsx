"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "../components/AuthGuard";
import { DashboardChrome } from "../dashboard/DashboardChrome";
import { SettingsShell } from "./_components/SettingsShell";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      {(session) => (
        <DashboardChrome session={session}>
          <SettingsShell>{children}</SettingsShell>
        </DashboardChrome>
      )}
    </AuthGuard>
  );
}
