"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretDown,
  Crown,
  ChatCircleDots,
  Flag,
  Prohibit,
} from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import { MonoLabel } from "../../components/ui/MonoLabel";
import type { Squad, RosterMember } from "../../chat/_data/seed";

type Props = {
  squad: Squad;
  myHandle: string;
  myName: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

function lastSeenLabel(min: number): string {
  if (min < 5) return "Just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function MemberRow({
  member,
  index,
  isMe = false,
}: {
  member: RosterMember | { handle: string; name: string; role: "op"; online: true; lastSeenMin: 0; streak: number; tz: string };
  index: number;
  isMe?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 * index, ease }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] md:px-7"
      >
        {/* Avatar with online dot — bone for online, hidden for offline.
            Ember only for the special "active right now" case if needed. */}
        <div className="relative shrink-0">
          <Avatar name={member.name} size="md" />
          {member.online ? (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bone ring-2 ring-[var(--squad-paper)]"
            />
          ) : null}
        </div>

        {/* Name + handle + lead/you tags */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-sans text-[15px] font-bold uppercase tracking-tight text-bone">
              {member.name}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-300/65">
              @{member.handle}
            </span>
            {isMe ? (
              <span
                aria-label="You"
                className="inline-flex items-center border border-ember-400/40 bg-ember-400/[0.06] px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-ember-400"
              >
                You
              </span>
            ) : null}
            {member.role === "lead" ? (
              <span
                aria-label="Squad lead"
                className="inline-flex items-center gap-0.5 border border-white/20 px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-bone/85"
              >
                <Crown size={9} weight="regular" />
                Lead
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300/55">
            <span>{member.tz}</span>
            <span aria-hidden className="h-2.5 w-px bg-white/15" />
            <span>
              {member.online ? (
                <span className="text-bone">Active now</span>
              ) : (
                lastSeenLabel(member.lastSeenMin)
              )}
            </span>
          </div>
        </div>

        {/* Streak number */}
        <div className="hidden text-right sm:block">
          <div className="font-mono text-[20px] font-extrabold tabular-nums leading-none text-bone">
            {member.streak}
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/55">
            Day streak
          </div>
        </div>

        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-ink-300/60 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded — actions and quick stats */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04] bg-ink-900/40 px-5 py-5 md:px-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Quick stats */}
                <dl className="grid grid-cols-2 gap-x-5 gap-y-3 md:col-span-2 md:grid-cols-3">
                  <div>
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                      Streak
                    </dt>
                    <dd className="mt-1 font-mono text-[14px] font-bold tabular-nums text-bone">
                      {member.streak}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                      Time zone
                    </dt>
                    <dd className="mt-1 font-mono text-[14px] text-bone">
                      {member.tz}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                      Status
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-1.5 font-mono text-[13px] text-bone">
                      <span
                        aria-hidden
                        className={`h-2 w-2 rounded-full ${
                          member.online ? "bg-bone" : "bg-ink-500"
                        }`}
                      />
                      {member.online
                        ? "Active now"
                        : lastSeenLabel(member.lastSeenMin)}
                    </dd>
                  </div>
                </dl>

                {/* Actions */}
                {!isMe ? (
                  <div className="flex flex-col gap-2 md:items-end">
                    <a
                      href={`/chat?s=${"callsign" in member ? "" : ""}`}
                      className="tactile inline-flex items-center gap-2 border border-white/15 bg-ink-900 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone transition hover:border-white/30"
                    >
                      <ChatCircleDots size={12} weight="bold" />
                      Open chat
                    </a>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 border border-white/15 bg-ink-900 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-200/80 transition hover:border-white/30 hover:text-bone"
                    >
                      <Flag size={12} weight="regular" />
                      Report
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 border border-white/15 bg-ink-900 px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-200/80 transition hover:border-ember-400/40 hover:text-ember-400"
                    >
                      <Prohibit size={12} weight="bold" />
                      Block
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                      You
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

export function RosterTab({ squad, myHandle, myName }: Props) {
  const me = {
    handle: myHandle,
    name: myName,
    role: "op" as const,
    online: true as const,
    lastSeenMin: 0 as const,
    streak: 6,
    tz: "Local",
  };
  const onlineCount = squad.roster.filter((m) => m.online).length + 1;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-10 md:px-10 md:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <header className="lg:col-span-4">
          <MonoLabel ember>Roster</MonoLabel>
          <h2 className="mt-4 text-balance font-sans text-[clamp(1.8rem,3.4vw,2.6rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
            Who&rsquo;s in the squad.
          </h2>
          <p className="mt-5 max-w-[44ch] text-[14px] leading-relaxed text-ink-200/80">
            Tap any operative to see their stats and the actions you can take.
            Blocking is mutual: they can&rsquo;t see you either.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.06] pt-6">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Total
              </dt>
              <dd className="mt-1 font-mono text-[24px] font-extrabold tabular-nums leading-none text-bone">
                {squad.roster.length + 1}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                Online
              </dt>
              <dd className="mt-1 inline-flex items-baseline gap-2 font-mono text-[24px] font-extrabold tabular-nums leading-none text-bone">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 self-center rounded-full bg-bone"
                />
                {onlineCount}
              </dd>
            </div>
          </dl>
        </header>

        <ul className="squad-paper-raised lg:col-span-8 divide-y divide-white/[0.05]">
          <MemberRow member={me} index={0} isMe />
          {squad.roster.map((m, i) => (
            <MemberRow key={m.handle} member={m} index={i + 1} />
          ))}
        </ul>
      </div>
    </div>
  );
}
