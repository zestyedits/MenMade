"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Timer,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { Section } from "../../components/ui/Section";
import { mockCycle } from "../../lib/mock-data";
import { store } from "../../lib/store";

export default function NewFieldLogEntryPage() {
  const router = useRouter();
  const [day, setDay] = useState<number>(mockCycle.day);
  const [minutes, setMinutes] = useState<number>(45);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filed, setFiled] = useState(false);

  useEffect(() => {
    const p = store.getProgress();
    if (p.currentCycleDay > 0) setDay(p.currentCycleDay);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (day < 1 || day > 365) next.day = "Day 1 to 365.";
    if (minutes < 0 || minutes > 1440) next.minutes = "0 to 1440 minutes.";
    if (!note.trim()) next.note = "What did you do? One sentence is enough.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    store.appendFieldLog({
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cycleCode: mockCycle.cycleCode,
      day,
      minutes,
      note: note.trim(),
      loggedAtIso: new Date().toISOString(),
    });
    if (minutes > 0) store.logMinutes(minutes);
    setFiled(true);
  }

  if (filed) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
        <div className="border border-ember-400/30 bg-ember-400/[0.04] p-10 md:p-14">
          <CheckCircle
            size={32}
            weight="fill"
            className="text-ember-400"
          />
          <MonoLabel ember>Filed</MonoLabel>
          <h1 className="mt-4 text-balance text-[40px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[56px]">
            Logged. Squad sees it.
          </h1>
          <p className="mt-5 max-w-[55ch] text-[15px] leading-relaxed text-ink-200/85">
            Day{" "}
            <span className="font-mono font-bold tabular-nums text-bone">
              {String(day).padStart(2, "0")}
            </span>
            {" "}of cycle{" "}
            <span className="font-mono text-bone">{mockCycle.cycleCode}</span>
            . {minutes > 0 ? `${minutes} min on the workbench. ` : ""}
            Streak updated.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/dashboard">
              Back to dashboard
              <ArrowRight size={14} weight="bold" />
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setNote("");
                setMinutes(45);
                setFiled(false);
              }}
            >
              Log another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-10 md:py-14">
      <header className="mb-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/70 transition hover:text-bone"
        >
          <ArrowLeft size={12} weight="bold" />
          Back
        </button>

        <div className="mt-4">
          <MonoLabel ember>Field log / new entry</MonoLabel>
          <h1 className="mt-3 text-balance text-[40px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[56px]">
            File a brief.
          </h1>
          <p className="mt-4 max-w-[55ch] text-[15px] leading-relaxed text-ink-200/80">
            One sentence is enough. The squad sees it. Time logged contributes
            to your cycle total.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]"
      >
        <div className="flex flex-col gap-8">
          <Section
            kicker="01 / Context"
            title="Cycle & day"
            description={
              <>
                You&rsquo;re logging against{" "}
                <span className="font-mono text-bone">{mockCycle.cycleCode}</span>
                . Day number is editable in case you&rsquo;re filing a
                backlog entry.
              </>
            }
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Cycle"
                value={mockCycle.cycleCode}
                readOnly
                hint={mockCycle.cycleName}
              />
              <Input
                label="Day"
                type="number"
                inputMode="numeric"
                min={1}
                max={365}
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value, 10) || 0)}
                error={errors.day}
              />
            </div>
          </Section>

          <Section
            kicker="02 / Time"
            title="Minutes on the workbench"
            description="Optional. Zero is fine if today was a check-in, not a session."
          >
            <div className="flex flex-col gap-4">
              <Input
                label="Minutes"
                type="number"
                inputMode="numeric"
                min={0}
                max={1440}
                value={minutes}
                onChange={(e) =>
                  setMinutes(parseInt(e.target.value, 10) || 0)
                }
                error={errors.minutes}
              />
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60, 90, 120].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMinutes(preset)}
                    aria-pressed={minutes === preset}
                    className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition ${
                      minutes === preset
                        ? "border-ember-400/60 bg-ember-400/[0.08] text-ember-400"
                        : "border-white/10 text-ink-200/80 hover:border-white/25 hover:text-bone"
                    }`}
                  >
                    <Timer size={11} weight="bold" />
                    {preset} min
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section
            kicker="03 / Brief"
            title="What did you do?"
            description="The squad reads this. Receipts beat opinions — be specific."
          >
            <div className="flex flex-col gap-2">
              <textarea
                id="note"
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1200}
                placeholder="One paragraph. What got done, what was hard, what's next."
                aria-invalid={errors.note ? true : undefined}
                className={`block w-full bg-ink-900 border px-3.5 py-3 text-[14.5px] leading-relaxed text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30 ${
                  errors.note ? "border-ember-400/60" : "border-white/10"
                }`}
              />
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/55">
                {errors.note ? (
                  <span className="text-ember-400">{errors.note}</span>
                ) : (
                  <span>The squad will see this in your field log.</span>
                )}
                <span className="tabular-nums">{note.length} / 1200</span>
              </div>
            </div>
          </Section>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
            <Button type="submit">
              File brief
              <ArrowRight size={14} weight="bold" />
            </Button>
            <Button variant="secondary" href="/dashboard">
              Cancel
            </Button>
          </div>
        </div>

        {/* Right rail — context for the entry */}
        <aside className="flex flex-col gap-4 border border-white/[0.06] bg-ink-900/40 p-6 lg:sticky lg:top-24 lg:self-start">
          <MonoLabel>Filing to</MonoLabel>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400/85">
              {mockCycle.cycleCode}
            </div>
            <h2 className="mt-1 text-[18px] font-extrabold uppercase leading-tight tracking-tight text-bone">
              {mockCycle.cycleName}
            </h2>
          </div>

          <dl className="mt-2 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
            <div className="flex items-baseline justify-between">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                Day
              </dt>
              <dd className="font-mono text-[13px] font-bold tabular-nums text-bone">
                {String(day).padStart(2, "0")}{" "}
                <span className="text-ink-300/55">
                  / {String(mockCycle.totalDays).padStart(2, "0")}
                </span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                Minutes
              </dt>
              <dd className="font-mono text-[13px] font-bold tabular-nums text-bone">
                {minutes}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                Note length
              </dt>
              <dd className="font-mono text-[13px] tabular-nums text-bone">
                {note.length}
              </dd>
            </div>
          </dl>

          <p className="mt-2 border-t border-white/[0.06] pt-4 text-[12.5px] leading-relaxed text-ink-300/70">
            Filing posts to your squad&rsquo;s field log and updates your
            personal log. Time logged adds to your cycle total minutes.
          </p>
        </aside>
      </form>
    </div>
  );
}
