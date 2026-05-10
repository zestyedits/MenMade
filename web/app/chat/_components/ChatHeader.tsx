"use client";

import {
  ShieldCheck,
  UsersThree,
  Broadcast,
  CaretLeft,
} from "@phosphor-icons/react/dist/ssr";
import { LiveDot } from "../../components/ui/LiveDot";

type Props = {
  squadName: string;
  callsign: string;
  cycleCode: string;
  cycleDay: number;
  totalDays: number;
  intensity: string;
  onlineCount: number;
  totalCount: number;
  onOpenCOC: () => void;
  onBack?: () => void;
};

export function ChatHeader({
  squadName,
  callsign,
  cycleCode,
  cycleDay,
  totalDays,
  intensity,
  onlineCount,
  totalCount,
  onOpenCOC,
  onBack,
}: Props) {
  return (
    <header className="relative bg-ink-900">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-4 md:px-10 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to squad list"
                className="tactile inline-flex shrink-0 items-center gap-1 border border-white/15 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/85 transition hover:border-white/25 hover:text-bone lg:hidden"
              >
                <CaretLeft size={12} weight="bold" />
                Squads
              </button>
            ) : null}
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-white/15 bg-ink-800 text-bone">
              <Broadcast size={16} weight="fill" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase leading-none tracking-[0.32em] text-bone">
                  {callsign}
                </span>
                <span aria-hidden className="h-2.5 w-px bg-white/15" />
                <span className="font-mono text-[10px] uppercase leading-none tracking-[0.22em] text-ink-300/65">
                  Squad ledger
                </span>
              </div>
              <h1 className="mt-1.5 truncate font-sans text-[20px] font-extrabold uppercase leading-none tracking-tight text-bone md:text-[22px]">
                {squadName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em]">
            <span className="inline-flex items-center gap-1.5 text-ink-200/80">
              <span className="text-ink-300/55">Cycle</span>
              <span className="font-bold text-bone">{cycleCode}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1.5 text-ink-200/80">
              <span className="text-ink-300/55">Day</span>
              <span className="font-bold tabular-nums text-bone">
                {String(cycleDay).padStart(2, "0")}
              </span>
              <span className="text-ink-300/45">
                / {String(totalDays).padStart(2, "0")}
              </span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1.5 text-ink-200/80">
              <span className="text-ink-300/55">Dial</span>
              <span className="text-bone">{intensity}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-2 text-ink-200/80">
              <LiveDot />
              <UsersThree
                size={11}
                weight="bold"
                className="text-ink-300/70"
              />
              <span className="font-bold tabular-nums text-bone">
                {onlineCount}
              </span>
              <span className="text-ink-300/45">/ {totalCount}</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <button
              type="button"
              onClick={onOpenCOC}
              aria-label="Open code of conduct"
              className="tactile inline-flex items-center gap-1.5 border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/85 transition hover:border-ember-400/40 hover:text-bone"
            >
              <ShieldCheck size={11} weight="bold" />
              Rules
            </button>
          </div>
        </div>
      </div>

      <div className="chat-rule-strong" aria-hidden />
    </header>
  );
}
