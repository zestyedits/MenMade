"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSession, type Session } from "../lib/auth";
import { store } from "../lib/store";

type Props = {
  children: (session: Session) => ReactNode;
  requireOnboarding?: boolean;
};

export function AuthGuard({ children, requireOnboarding = true }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | "loading">("loading");

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/auth/sign-in");
      return;
    }
    if (requireOnboarding && !store.hasOnboarded()) {
      router.replace("/onboarding");
      return;
    }
    setSession(s);
  }, [router, requireOnboarding]);

  if (session === "loading" || session === null) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-ink-950">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/60">
          Authenticating...
        </div>
      </div>
    );
  }

  return <>{children(session)}</>;
}
