"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";
import { SquadHero } from "../_components/SquadHero";
import { SquadTabs, type TabId } from "../_components/SquadTabs";
import { BriefTab } from "../_components/BriefTab";
import { RosterTab } from "../_components/RosterTab";
import { FieldLogTab } from "../_components/FieldLogTab";
import { SettingsTab } from "../_components/SettingsTab";
import { SQUADS } from "../../chat/_data/seed";
import { getSession } from "../../lib/auth";
import { store } from "../../lib/store";

const ease = [0.16, 1, 0.3, 1] as const;

const VALID_TABS: TabId[] = ["brief", "roster", "field-log", "settings"];

function isValidTab(v: string | null): v is TabId {
  return v !== null && (VALID_TABS as string[]).includes(v);
}

export default function SquadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Resolve squad from slug — case-insensitive callsign match
  const squad = SQUADS.find(
    (s) => s.callsign.toUpperCase() === slug.toUpperCase(),
  );

  // If the slug doesn't match any squad, fall through to the branded 404.
  if (!squad) notFound();

  // Tab state synced to URL query (?tab=brief) so back/forward + sharing work.
  const [tab, setTab] = useState<TabId>("brief");
  const [myHandle, setMyHandle] = useState("you");
  const [myName, setMyName] = useState("You");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (isValidTab(t)) setTab(t);
  }, []);

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

  function handleTabChange(next: TabId) {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState(null, "", url.toString());
    }
  }

  // Mock: treat user as lead if they happen to be marked as such in mock
  // data. UI-first impl — real impl checks server-side role.
  const isLead = false;

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
