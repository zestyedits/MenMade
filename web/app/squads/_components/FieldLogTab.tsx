"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Camera,
  ChatCircleDots,
  Warning,
  Funnel,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import { MonoLabel } from "../../components/ui/MonoLabel";
import type { Squad } from "../../chat/_data/seed";

type Props = {
  squad: Squad;
};

type EntryType = "all" | "completion" | "photo" | "brief" | "miss";

type Entry = {
  id: string;
  authorHandle: string;
  authorName: string;
  type: Exclude<EntryType, "all">;
  day: number;
  minutes?: number;
  note: string;
  hoursAgo: number;
};

const ease = [0.16, 1, 0.3, 1] as const;

const TYPE_LABELS: Record<Exclude<EntryType, "all">, string> = {
  completion: "Completion",
  photo: "Photo evidence",
  brief: "Brief",
  miss: "Miss",
};

const TYPE_ICON = {
  completion: CheckCircle,
  photo: Camera,
  brief: ChatCircleDots,
  miss: Warning,
} as const;

function buildEntries(squad: Squad): Entry[] {
  const entries: Entry[] = [];
  let id = 0;

  squad.roster.forEach((m, mi) => {
    // Today's completion
    entries.push({
      id: `e-${id++}`,
      authorHandle: m.handle,
      authorName: m.name,
      type: "completion",
      day: squad.cycleDay,
      minutes: 30 + ((mi * 17) % 60),
      note: m.streak > 8
        ? `Cycled clean. ${m.streak}-day streak holds.`
        : `Logged. ${m.streak}-day streak.`,
      hoursAgo: 0.5 + mi * 1.2,
    });
    // Recent brief
    if (mi < 3) {
      entries.push({
        id: `e-${id++}`,
        authorHandle: m.handle,
        authorName: m.name,
        type: "brief",
        day: squad.cycleDay,
        note: `Filing notes from the workbench. Day ${squad.cycleDay} is honest work.`,
        hoursAgo: 2 + mi * 3,
      });
    }
    // Photo
    if (mi === 1) {
      entries.push({
        id: `e-${id++}`,
        authorHandle: m.handle,
        authorName: m.name,
        type: "photo",
        day: squad.cycleDay - 1,
        note: "Uploaded photo evidence to the squad ledger.",
        hoursAgo: 10,
      });
    }
    // Miss (flag a slacker)
    if (m.lastSeenMin > 120 && mi % 2 === 0) {
      entries.push({
        id: `e-${id++}`,
        authorHandle: m.handle,
        authorName: m.name,
        type: "miss",
        day: squad.cycleDay - 1,
        note: "Missed the daily check-in. Squad flagged.",
        hoursAgo: 22,
      });
    }
  });

  return entries.sort((a, b) => a.hoursAgo - b.hoursAgo);
}

function dayGroupLabel(hoursAgo: number): string {
  if (hoursAgo < 12) return "Today";
  if (hoursAgo < 36) return "Yesterday";
  const days = Math.floor(hoursAgo / 24);
  return `${days} days ago`;
}

function formatAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return `${Math.round(hoursAgo * 60)}m ago`;
  if (hoursAgo < 24) return `${Math.round(hoursAgo)}h ago`;
  const d = Math.floor(hoursAgo / 24);
  return `${d}d ago`;
}

export function FieldLogTab({ squad }: Props) {
  const [filter, setFilter] = useState<EntryType>("all");
  const allEntries = useMemo(() => buildEntries(squad), [squad]);
  const entries = useMemo(
    () => (filter === "all" ? allEntries : allEntries.filter((e) => e.type === filter)),
    [allEntries, filter],
  );

  // Group by relative day
  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach((e) => {
      const label = dayGroupLabel(e.hoursAgo);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(e);
    });
    return Array.from(map.entries());
  }, [entries]);

  const FILTERS: { id: EntryType; label: string; count: number }[] = [
    { id: "all", label: "All", count: allEntries.length },
    {
      id: "completion",
      label: "Completions",
      count: allEntries.filter((e) => e.type === "completion").length,
    },
    {
      id: "brief",
      label: "Briefs",
      count: allEntries.filter((e) => e.type === "brief").length,
    },
    {
      id: "photo",
      label: "Photos",
      count: allEntries.filter((e) => e.type === "photo").length,
    },
    {
      id: "miss",
      label: "Misses",
      count: allEntries.filter((e) => e.type === "miss").length,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-10 md:px-10 md:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Header */}
        <header className="lg:col-span-4">
          <MonoLabel ember>Field log</MonoLabel>
          <h2 className="mt-4 text-balance font-sans text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
            The squad ledger.
          </h2>
          <p className="mt-5 max-w-[44ch] text-[14px] leading-relaxed text-ink-200/80">
            Completions, briefs, photo evidence, and the occasional flagged
            miss. This is the receipts feed &mdash; chat is for the
            conversation, the ledger is for the proof.
          </p>

          {/* Filter rail */}
          <div className="mt-8 flex flex-col gap-2 border-t border-white/[0.06] pt-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
              <Funnel size={11} weight="bold" />
              Filter
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const on = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition ${
                      on
                        ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                        : "border-white/10 text-ink-200/80 hover:border-white/25 hover:text-bone"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`tabular-nums ${
                        on ? "text-ember-400/70" : "text-ink-300/50"
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Entries */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {entries.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="squad-paper-raised border border-white/[0.05] px-8 py-16 text-center"
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink-300/70">
                  Filter empty
                </p>
                <p className="mt-3 max-w-[40ch] mx-auto text-[14px] leading-relaxed text-ink-200/80">
                  Nothing under that filter. Switch to{" "}
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="text-bone underline underline-offset-4 decoration-bone/40 transition hover:decoration-bone"
                  >
                    All
                  </button>{" "}
                  to see the full ledger.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`entries-${filter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-10"
              >
                {grouped.map(([groupLabel, groupEntries], gi) => (
                  <section key={groupLabel}>
                    <div className="flex items-center gap-3 pb-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-bone">
                        {groupLabel}
                      </span>
                      <span aria-hidden className="h-px flex-1 bg-white/[0.06]" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-ink-300/55">
                        {groupEntries.length}{" "}
                        {groupEntries.length === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                    <ul className="flex flex-col divide-y divide-white/[0.04] border-y border-white/[0.06]">
                      {groupEntries.map((e, ei) => {
                        const Icon = TYPE_ICON[e.type];
                        const isMiss = e.type === "miss";
                        return (
                          <motion.li
                            key={e.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.04 * (gi * 3 + ei),
                              ease,
                            }}
                            className="flex items-start gap-4 py-4"
                          >
                            <Avatar name={e.authorName} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <span className="font-sans text-[14px] font-bold text-bone">
                                  {e.authorName.split(" ")[0]}
                                </span>
                                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/65">
                                  @{e.authorHandle}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 border px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${
                                    isMiss
                                      ? "border-ember-400/60 bg-ember-400/[0.06] text-ember-400"
                                      : "border-white/15 text-bone/85"
                                  }`}
                                >
                                  <Icon size={9} weight="fill" />
                                  {TYPE_LABELS[e.type]}
                                </span>
                                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] tabular-nums text-ink-300/55">
                                  Day {String(e.day).padStart(2, "0")} &middot;{" "}
                                  {formatAgo(e.hoursAgo)}
                                </span>
                              </div>
                              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-100/90">
                                {e.note}
                              </p>
                              {e.minutes !== undefined ? (
                                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
                                  {e.minutes} minutes logged
                                </p>
                              ) : null}
                            </div>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
