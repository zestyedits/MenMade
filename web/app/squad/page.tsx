"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MY_SQUAD_CALLSIGNS } from "../chat/_data/seed";
import { store } from "../lib/store";

// Singular /squad routes to the user's active squad detail page.
// Falls back to the first squad in their roster, or /cycles if they
// haven't joined any squads yet.
export default function SquadRedirect() {
  const router = useRouter();

  useEffect(() => {
    const active = store.getActiveSquad();
    const target =
      active && MY_SQUAD_CALLSIGNS.includes(active)
        ? active
        : MY_SQUAD_CALLSIGNS[0] ?? null;
    if (target) {
      router.replace(`/squads/${target}`);
    } else {
      router.replace("/cycles");
    }
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
        Routing to your squad...
      </p>
    </div>
  );
}
