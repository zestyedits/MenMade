"use client";

import { use, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { SquadHero } from "../_components/SquadHero";
import { SquadTabs, type TabId } from "../_components/SquadTabs";
import { BriefTab } from "../_components/BriefTab";
import { RosterTab } from "../_components/RosterTab";
import { FieldLogTab } from "../_components/FieldLogTab";
import { SettingsTab } from "../_components/SettingsTab";
import type { Squad, RosterMember } from "../../chat/_data/seed";
import type { Intensity } from "../../lib/store";
import { getSession } from "../../lib/auth";
import { store } from "../../lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

const VALID_TABS: TabId[] = ["brief", "roster", "field-log", "settings"];

function isValidTab(v: string | null): v is TabId {
  return v !== null && (VALID_TABS as string[]).includes(v);
}

type ApiSquad = {
  id: string;
  handle: string;
  callsign: string;
  name: string;
  kind: "private" | "founders_circle";
  blurb: string | null;
  focus: string[] | null;
  intensity: Intensity | null;
  tzBand: string | null;
  cycleCode: string | null;
  cycleDay: number;
  totalDays: number | null;
  createdAt: string;
};

type ApiMember = {
  userId: string;
  handle: string;
  displayName: string;
  role: "member" | "lead" | "founder";
  joinedAt: string;
  isYou: boolean;
};

type ApiResponse =
  | { ok: true; squad: ApiSquad; role: "member" | "lead" | "founder"; members: ApiMember[] }
  | { ok: false; error: string };

// The Squad type that the tab components were built around predates the
// live-data wiring. This adapter fills the gap: it maps the API shape onto
// the legacy shape so the tabs render unchanged.
//
// Fields that don't yet exist server-side (online status, streaks, tz) are
// stubbed; the FieldLogTab + SettingsTab still consume seed-shaped extras
// (seedMessages, replyPool) that are unused by their actual render paths.
function adaptSquad(api: ApiSquad, members: ApiMember[]): Squad {
  const intensityUpper = (api.intensity ?? "steady").toUpperCase() as
    | "LIGHT"
    | "STEADY"
    | "HEAVY"
    | "BRUTAL";
  const roster: RosterMember[] = members
    .filter((m) => !m.isYou)
    .map((m) => ({
      handle: m.handle,
      name: m.displayName,
      role: m.role === "lead" ? "lead" : "op",
      online: false,
      lastSeenMin: 0,
      streak: 0,
      tz: "",
    }));
  return {
    callsign: api.callsign,
    name: api.name,
    blurb: api.blurb ?? "",
    cycleCode: api.cycleCode ?? "—",
    cycleDay: api.cycleDay,
    totalDays: api.totalDays ?? 0,
    intensity: intensityUpper,
    focus: (api.focus ?? []).join(" · "),
    roster,
    seedMessages: [],
    replyPool: [],
  };
}

export default function SquadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | "loading">("loading");
  const [tab, setTab] = useState<TabId>("brief");
  const [myHandle, setMyHandle] = useState("you");
  const [myName, setMyName] = useState("You");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = store.getIdentity();
      const s = await getSession();
      if (cancelled) return;
      if (id?.handle) {
        setMyHandle(id.handle);
        setMyName(id.displayName || s?.name || "You");
      } else if (s) {
        setMyHandle(s.handle || "you");
        setMyName(s.name || "You");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/squads/${encodeURIComponent(slug)}`, {
          credentials: "same-origin",
        });
        if (res.status === 404) {
          if (!cancelled) setData({ ok: false, error: "not-found" });
          return;
        }
        if (res.status === 403) {
          // Caller isn't a member. Bounce them to /chat — same redirect the
          // /squad shim uses for "your squad" wayfinding.
          router.replace("/chat");
          return;
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (err) {
        console.warn("[squad/[slug]] load failed:", err);
        if (!cancelled) setData({ ok: false, error: "network" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const t = search.get("tab");
    if (isValidTab(t)) setTab(t);
  }, []);

  function handleTabChange(next: TabId) {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState(null, "", url.toString());
    }
  }

  const squad = useMemo(
    () =>
      data !== "loading" && data.ok
        ? adaptSquad(data.squad, data.members)
        : null,
    [data],
  );
  const role = data !== "loading" && data.ok ? data.role : "member";
  const isLead = role === "lead" || role === "founder";

  if (data === "loading") {
    return (
      <div className="grid min-h-[40dvh] place-items-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
          Loading squad…
        </span>
      </div>
    );
  }

  if (!data.ok && data.error === "not-found") {
    notFound();
  }

  if (!squad) {
    return (
      <div className="grid min-h-[40dvh] place-items-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
          Couldn&rsquo;t load squad. Refresh.
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SquadHero squad={squad} myHandle={myHandle} myName={myName} />
      <SquadTabs active={tab} onChange={handleTabChange} />

      <div className="squad-paper flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
          >
            {tab === "brief" ? <BriefTab squad={squad} /> : null}
            {tab === "roster" ? (
              <RosterTab squad={squad} myHandle={myHandle} myName={myName} />
            ) : null}
            {tab === "field-log" ? <FieldLogTab squad={squad} /> : null}
            {tab === "settings" ? (
              <SettingsTab squad={squad} isLead={isLead} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
