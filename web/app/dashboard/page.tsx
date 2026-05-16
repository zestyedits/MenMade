"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CycleStrip } from "./_sections/CycleStrip";
import { TodayDirective } from "./_sections/TodayDirective";
import { SquadActivity, type ActivityEvent } from "./_sections/SquadActivity";
import { WeeklyCadence } from "./_sections/WeeklyCadence";
import { CycleObjectives } from "./_sections/CycleObjectives";
import { mockDirective, mockObjectives } from "../lib/mock-data";
import { getSession } from "../lib/auth";
import { store } from "../lib/store";

const MAX_FEED = 24;

type DayState = "complete" | "missed" | "today" | "future";

type DashboardState = {
  cycle: {
    code: string;
    name: string;
    day: number;
    totalDays: number;
    startedAt: string;
  } | null;
  streak: number;
  weeklyCadence: { date: string; state: DayState }[];
  activityEvents: ActivityEvent[];
  squadName: string | null;
  squadSlug: string | null;
};

export default function DashboardPage() {
  const [handle, setHandle] = useState("you");
  const [completedToday, setCompletedToday] = useState(false);
  const [state, setState] = useState<DashboardState | null>(null);
  // Local optimistic overlays that ride on top of the server state without
  // forcing a refetch: events the user generates in this tab, and per-day
  // cadence flips when they mark Today complete.
  const [optimisticEvents, setOptimisticEvents] = useState<ActivityEvent[]>([]);
  const [optimisticStreakDelta, setOptimisticStreakDelta] = useState(0);
  const [optimisticCadenceComplete, setOptimisticCadenceComplete] =
    useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSession();
      if (!cancelled && s) setHandle(s.handle || s.name || "you");
      if (!cancelled) {
        const id = store.getIdentity();
        if (id?.handle) setHandle(id.handle);
        const progress = store.getProgress();
        if (progress.lastCheckInIso) {
          const last = new Date(progress.lastCheckInIso);
          const today = new Date();
          if (
            last.getFullYear() === today.getFullYear() &&
            last.getMonth() === today.getMonth() &&
            last.getDate() === today.getDate()
          ) {
            setCompletedToday(true);
          }
        }
      }

      try {
        const res = await fetch("/api/dashboard/state", {
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { ok: boolean } & DashboardState;
        if (!cancelled && json.ok) {
          setState({
            cycle: json.cycle,
            streak: json.streak,
            weeklyCadence: json.weeklyCadence,
            activityEvents: json.activityEvents,
            squadName: json.squadName,
            squadSlug: json.squadSlug,
          });
        }
      } catch {
        // Network failure shouldn't crash the dashboard chrome — leave
        // state=null so the empty-state copy renders instead of mock noise.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(() => {
    const base = state?.activityEvents ?? [];
    return [...optimisticEvents, ...base].slice(0, MAX_FEED);
  }, [state, optimisticEvents]);

  const cadence = useMemo(() => {
    const base = state?.weeklyCadence ?? [];
    if (!optimisticCadenceComplete) return base;
    return base.map((d, i) =>
      i === base.length - 1 ? { ...d, state: "complete" as DayState } : d,
    );
  }, [state, optimisticCadenceComplete]);

  const streak = (state?.streak ?? 0) + optimisticStreakDelta;
  const squadName = state?.squadName ?? "No squad yet";
  const squadSlug = state?.squadSlug ?? null;

  const handleComplete = useCallback(
    (loggedMinutes: number) => {
      if (completedToday) return;
      setCompletedToday(true);
      setOptimisticStreakDelta((d) => d + 1);
      setOptimisticCadenceComplete(true);
      setOptimisticEvents((prev) => [
        {
          id: `you-complete-${Date.now()}`,
          name: "You",
          action: `marked Day ${state?.cycle?.day ?? 1} — ${loggedMinutes} min logged.`,
          timeAgo: "just now",
          fresh: true,
        },
        ...prev,
      ]);

      store.bumpStreak();
      store.logMinutes(loggedMinutes);
      if (state?.cycle) {
        store.appendFieldLog({
          id: `entry-${Date.now()}`,
          cycleCode: state.cycle.code,
          day: state.cycle.day,
          minutes: loggedMinutes,
          note: "Marked complete from dashboard.",
          loggedAtIso: new Date().toISOString(),
        });
      }
    },
    [completedToday, state],
  );

  const handleObjectiveToggle = useCallback(
    (objective: { id: string; label: string }, nowDone: boolean) => {
      if (!nowDone) return;
      setOptimisticEvents((prev) => [
        {
          id: `you-obj-${objective.id}-${Date.now()}`,
          name: "You",
          action: `completed an objective: "${objective.label.split(".")[0]}".`,
          timeAgo: "just now",
          fresh: true,
          highlight: true,
        },
        ...prev,
      ]);
      if (state?.cycle) {
        store.appendFieldLog({
          id: `obj-${objective.id}-${Date.now()}`,
          cycleCode: state.cycle.code,
          day: state.cycle.day,
          minutes: 0,
          note: `Objective complete: ${objective.label}`,
          loggedAtIso: new Date().toISOString(),
        });
      }
    },
    [state],
  );

  const directiveProps = useMemo(
    () => ({
      ...mockDirective,
      day: state?.cycle?.day ?? mockDirective.day,
      completed: completedToday,
      onComplete: handleComplete,
    }),
    [completedToday, handleComplete, state],
  );

  return (
    <>
      {/* Visually anchored by CycleStrip; the H1 is sr-only so AT users
          and document outline still get a real page identity. */}
      <h1 className="sr-only">Dashboard — @{handle}</h1>

      {state?.cycle ? (
        <CycleStrip
          cycleCode={state.cycle.code}
          cycleName={state.cycle.name}
          day={state.cycle.day}
          totalDays={state.cycle.totalDays}
          startedAt={state.cycle.startedAt}
          operativeHandle={handle}
        />
      ) : null}

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-5 py-7 md:gap-7 md:px-10 md:py-9 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TodayDirective {...directiveProps} />
        </div>

        <aside className="lg:col-span-4">
          <SquadActivity
            squadName={squadName}
            squadSlug={squadSlug}
            events={events}
          />
        </aside>

        <div className="lg:col-span-5">
          <WeeklyCadence days={cadence} streak={streak} />
        </div>
        <div className="lg:col-span-7">
          <CycleObjectives
            initial={mockObjectives}
            onToggle={handleObjectiveToggle}
          />
        </div>
      </div>
    </>
  );
}
