import { Check, X, Minus } from "@phosphor-icons/react/dist/ssr";
import { MonoLabel } from "../../components/ui/MonoLabel";

type DayState = "complete" | "missed" | "pending" | "today" | "future";

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  days: { date: string; state: DayState }[];
  streak: number;
};

export function WeeklyCadence({ days, streak }: Props) {
  return (
    <section
      aria-labelledby="cadence-heading"
      className="flex flex-col gap-5 border border-white/[0.06] bg-ink-900/40 p-6"
    >
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <MonoLabel>Cadence</MonoLabel>
          <h2 id="cadence-heading" className="text-[15px] font-semibold text-bone">
            Last 14 days
          </h2>
        </div>
        <div className="flex items-baseline gap-2 font-mono">
          <span className="text-[28px] font-bold tabular-nums text-bone">
            {streak}
          </span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-ember-400/80">
            day streak
          </span>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1.5">
        {labels.map((l) => (
          <div
            key={l}
            className="text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink-300/60"
          >
            {l}
          </div>
        ))}
        {days.map((d) => {
          const base =
            "relative flex aspect-square items-center justify-center border text-bone";
          const state = {
            complete: "bg-ember-400 border-ember-400 text-ink-950",
            missed: "bg-ink-900 border-white/10 text-ink-400",
            pending: "bg-ink-900 border-white/10 text-ink-300/60",
            today: "bg-ink-900 border-bone text-bone",
            future: "bg-transparent border-white/[0.06] text-ink-400/60",
          }[d.state];
          const Icon =
            d.state === "complete"
              ? Check
              : d.state === "missed"
                ? X
                : d.state === "today"
                  ? null
                  : Minus;
          return (
            <div
              key={d.date}
              className={`${base} ${state}`}
              title={`${d.date}: ${d.state}`}
              aria-label={`${d.date}: ${d.state}`}
            >
              {d.state === "today" ? (
                <span className="font-mono text-[10px] font-bold tabular-nums">
                  {new Date(d.date).getDate()}
                </span>
              ) : Icon ? (
                <Icon size={12} weight="bold" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
