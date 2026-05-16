"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Singular /squad routes to the user's first active squad's detail page.
 * Falls back to /squads/founders-circle if the user has no squads yet —
 * matched policy enrolls every new operative there until a focused squad
 * spins off, so it's always the correct landing.
 *
 * Live-data version: hits /api/squads/me instead of the seed const so
 * the redirect respects real membership (e.g. the Founders Circle
 * everyone lands in post-onboarding).
 */
export default function SquadRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/squads/me", {
          credentials: "same-origin",
        });
        const json = (await res.json()) as
          | { ok: true; squads: { handle: string }[] }
          | { ok: false };
        if (cancelled) return;
        if (json.ok && json.squads.length > 0) {
          router.replace(`/squads/${json.squads[0].handle}`);
        } else {
          router.replace("/squads/founders-circle");
        }
      } catch {
        if (!cancelled) router.replace("/squads/founders-circle");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
        Routing to your squad...
      </p>
    </div>
  );
}
