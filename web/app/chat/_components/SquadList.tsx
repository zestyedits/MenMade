"use client";

import { Plus, Crown } from "@phosphor-icons/react/dist/ssr";
import { LiveDot } from "../../components/ui/LiveDot";
import type { Squad } from "../_data/seed";

type LastMessage = {
  authorName: string;
  body: string;
  sentAtIso: string;
} | null;

type Props = {
  squads: Squad[];
  activeCallsign: string;
  onSelect: (callsign: string) => void;
  lastMessageBy: Record<string, LastMessage>;
  unreadBy: Record<string, number>;
  myHandle: string;
  className?: string;
};

function formatAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function SquadList({
  squads,
  activeCallsign,
  onSelect,
  lastMessageBy,
  unreadBy,
  myHandle,
  className = "",
}: Props) {
  const cap = 3;

  return (
    <aside
      aria-label="My squads"
      className={`flex w-full shrink-0 flex-col bg-ink-900 lg:w-[300px] lg:border-r lg:border-white/[0.06] ${className}`}
    >
      <header className="border-b border-white/[0.06] px-5 py-4 md:px-6 md:py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ink-300/65">
          Your squads
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone">
            Channels
          </h2>
          <span className="font-mono text-[11px] tabular-nums text-ink-300/65">
            <span className="font-bold text-bone">{squads.length}</span>
            <span className="text-ink-300/45"> / {cap}</span>
          </span>
        </div>
      </header>

      <ul className="flex-1 overflow-y-auto py-1">
        {squads.map((s) => {
          const active = s.callsign === activeCallsign;
          const last = lastMessageBy[s.callsign] ?? null;
          const unread = unreadBy[s.callsign] ?? 0;
          const lead = s.roster.find((r) => r.role === "lead");
          const onlineCount =
            s.roster.filter((m) => m.online).length + 1; // +1 = you

          return (
            <li key={s.callsign}>
              <button
                type="button"
                onClick={() => onSelect(s.callsign)}
                aria-current={active ? "page" : undefined}
                className={`group relative w-full px-5 py-3.5 text-left transition md:px-6 ${
                  active
                    ? "bg-[var(--chat-paper)]"
                    : "hover:bg-white/[0.025]"
                }`}
              >
                {/* Active ember edge */}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-ember-400"
                  />
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] uppercase leading-none tracking-[0.28em] ${
                        active ? "text-bone" : "text-ink-200/75"
                      }`}
                    >
                      {s.callsign}
                    </span>
                    <span aria-hidden className="h-2.5 w-px bg-white/15" />
                    <span className="font-mono text-[9.5px] uppercase leading-none tracking-[0.22em] text-ink-300/55">
                      {s.focus}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase leading-none tracking-[0.18em] tabular-nums text-ink-300/55"
                    suppressHydrationWarning
                  >
                    {last ? formatAgo(last.sentAtIso) : "—"}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <h3
                    className={`truncate font-sans text-[15px] font-extrabold uppercase tracking-tight ${
                      active ? "text-bone" : "text-bone/85 group-hover:text-bone"
                    }`}
                  >
                    {s.name}
                  </h3>
                  {unread > 0 ? (
                    <span
                      aria-label={`${unread} unread`}
                      className="grid h-5 min-w-[20px] place-items-center bg-ember-400 px-1 font-mono text-[10px] font-bold tabular-nums leading-none text-ink-950"
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-[12.5px] leading-snug text-ink-200/65">
                  {last ? (
                    <>
                      <span
                        className={`font-medium ${
                          last.authorName === myHandle ||
                          last.authorName === "You"
                            ? "text-ember-400/80"
                            : "text-bone/85"
                        }`}
                      >
                        {last.authorName === "You" ? "You" : last.authorName.split(" ")[0]}
                      </span>
                      <span className="text-ink-300/55"> &middot; </span>
                      <span>{last.body}</span>
                    </>
                  ) : (
                    <span className="text-ink-300/55">No transmissions yet.</span>
                  )}
                </p>

                <div className="mt-2 flex items-center gap-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-300/55">
                  <span className="inline-flex items-center gap-1.5">
                    <LiveDot />
                    <span className="font-bold tabular-nums text-bone/80">
                      {onlineCount}
                    </span>
                    on
                  </span>
                  <span aria-hidden className="h-2.5 w-px bg-white/15" />
                  <span>
                    Day{" "}
                    <span className="font-bold tabular-nums text-bone/80">
                      {String(s.cycleDay).padStart(2, "0")}
                    </span>{" "}
                    / {String(s.totalDays).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-2.5 w-px bg-white/15" />
                  <span>{s.intensity}</span>
                  {lead ? (
                    <>
                      <span aria-hidden className="h-2.5 w-px bg-white/15" />
                      <span className="inline-flex items-center gap-1 text-ink-200/75">
                        <Crown size={9} weight="regular" className="text-ink-300/60" />
                        {lead.handle}
                      </span>
                    </>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}

        {squads.length < cap ? (
          <li className="mt-2 border-t border-white/[0.04] px-5 py-3 md:px-6">
            <a
              href="/cycles"
              className="flex w-full items-center justify-between gap-3 border border-dashed border-white/15 px-3 py-3 transition hover:border-ember-400/40 hover:bg-white/[0.02]"
            >
              <div>
                <div className="font-sans text-[14px] font-bold uppercase tracking-tight text-bone">
                  Find a squad
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                  {cap - squads.length} slot{cap - squads.length === 1 ? "" : "s"} open
                </div>
              </div>
              <Plus size={16} weight="bold" className="text-bone/80" />
            </a>
          </li>
        ) : (
          <li className="mt-2 border-t border-white/[0.04] px-5 py-3 md:px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
              Squad cap hit. Finish a cycle to free a slot.
            </p>
          </li>
        )}
      </ul>
    </aside>
  );
}
