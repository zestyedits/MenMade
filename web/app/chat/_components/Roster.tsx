"use client";

import { Crown } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "../../components/ui/Avatar";
import { MonoLabel } from "../../components/ui/MonoLabel";
import type { RosterMember } from "../_data/seed";

function lastSeen(min: number) {
  if (min < 5) return "now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

type Props = {
  squadName: string;
  callsign: string;
  cycleCode: string;
  cycleDay: number;
  totalDays: number;
  intensity: string;
  members: RosterMember[];
  myHandle: string;
  myName: string;
};

export function Roster({
  squadName,
  callsign,
  cycleCode,
  cycleDay,
  totalDays,
  intensity,
  members,
  myHandle,
  myName,
}: Props) {
  const online = members.filter((m) => m.online).length + 1; // +1 = you

  return (
    <aside
      aria-label="Squad roster"
      className="hidden w-[280px] shrink-0 flex-col border-l border-white/[0.06] bg-ink-900/30 lg:flex"
    >
      <header className="border-b border-white/[0.06] p-5">
        <MonoLabel>Roster</MonoLabel>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone">
            {callsign}
          </span>
          <span className="text-[15px] font-bold text-bone">{squadName}</span>
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 text-center">
          <li>
            <div className="font-mono text-[14px] font-bold tabular-nums text-bone">
              {String(cycleDay).padStart(2, "0")}
            </div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink-300/55">
              Day / {String(totalDays).padStart(2, "0")}
            </div>
          </li>
          <li>
            <div className="font-mono text-[14px] font-bold tabular-nums text-bone">
              {online}
            </div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink-300/55">
              Online
            </div>
          </li>
          <li>
            <div className="font-mono text-[14px] font-bold text-bone">
              {intensity[0]}
            </div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-ink-300/55">
              {intensity}
            </div>
          </li>
        </ul>
      </header>

      <ul className="flex-1 divide-y divide-white/[0.04] overflow-y-auto">
        {/* You */}
        <li className="flex items-center gap-3 bg-ember-400/[0.04] px-5 py-3">
          <div className="relative">
            <Avatar name={myName} size="sm" />
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-ember-400 ring-2 ring-ink-900"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[12.5px] font-bold text-bone">
                {myName}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember-400/85">
                You
              </span>
            </div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-300/60">
              @{myHandle}
            </div>
          </div>
        </li>

        {members.map((m) => (
          <li key={m.handle} className="flex items-center gap-3 px-5 py-3">
            <div className="relative">
              <Avatar name={m.name} size="sm" />
              <span
                aria-hidden
                className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-ink-900 ${
                  m.online ? "bg-ember-400" : "bg-ink-500"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[12.5px] font-bold text-bone/90">
                  {m.name.split(" ")[0]}
                </span>
                {m.role === "lead" ? (
                  <span
                    aria-label="Squad lead"
                    className="inline-flex items-center gap-0.5 border border-white/20 px-1.5 py-px font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-bone/85"
                  >
                    <Crown size={9} weight="regular" />
                    Lead
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-300/60">
                <span>@{m.handle}</span>
                <span aria-hidden className="h-2 w-px bg-white/15" />
                <span>{m.tz}</span>
                <span aria-hidden className="h-2 w-px bg-white/15" />
                <span className={m.online ? "text-bone/85" : ""}>
                  {lastSeen(m.lastSeenMin)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[12px] font-bold tabular-nums text-bone">
                {m.streak}
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-ink-300/55">
                Streak
              </div>
            </div>
          </li>
        ))}
      </ul>

      <footer className="border-t border-white/[0.06] px-5 py-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink-300/55">
          Frequency / B-04 / Encrypted local
        </div>
      </footer>
    </aside>
  );
}
