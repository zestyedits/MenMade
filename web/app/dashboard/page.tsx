"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CycleStrip } from "./_sections/CycleStrip";
import { TodayDirective } from "./_sections/TodayDirective";
import { SquadActivity, type ActivityEvent } from "./_sections/SquadActivity";
import { WeeklyCadence } from "./_sections/WeeklyCadence";
import { CycleObjectives } from "./_sections/CycleObjectives";
import {
  mockCycle,
  mockDirective,
  mockSquadName,
  mockActivity,
  mockCadence,
  mockStreak,
  mockObjectives,
  simulatedEventPool,
} from "../lib/mock-data";
import { getSession } from "../lib/auth";
import { store } from "../lib/store";

const MAX_FEED = 24;

export default function DashboardPage() {
  const [handle, setHandle] = useState("operative");

  // Live state — hydrated from the local store on mount so streak/progress
  // actually persists across sessions. Mock cycle/feed remain seed data.
  const [completedToday, setCompletedToday] = useState(false);
  const [streak, setStreak] = useState(mockStreak);
  const [cadence, setCadence] = useState(() => [...mockCadence]);
  const [events, setEvents] = useState<ActivityEvent[]>(mockActivity);

  useEffect(() => {
    const s = getSession();
    if (s) setHandle(s.handle);
    const id = store.getIdentity();
    if (id?.handle) setHandle(id.handle);
    const progress = store.getProgress();
    if (progress.streak > 0) setStreak(progress.streak);
    if (progress.lastCheckInIso) {
      const last = new Date(progress.lastCheckInIso);
      const today = new Date();
      const sameDay =
        last.getFullYear() === today.getFullYear() &&
        last.getMonth() === today.getMonth() &&
        last.getDate() === today.getDate();
      if (sameDay) setCompletedToday(true);
    }
  }, []);

  // Drip simulated squad activity. The interval re-randomises after each tick
  // so events arrive on uneven, more-human cadence rather than a metronome.
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    function schedule() {
      const wait = 25_000 + Math.random() * 20_000;
      tickRef.current = setTimeout(() => {
        const pick =
          simulatedEventPool[Math.floor(Math.random() * simulatedEventPool.length)];
        const ev: ActivityEvent = {
          id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: pick.name,
          action: pick.action,
          highlight: pick.highlight,
          timeAgo: "just now",
          fresh: true,
        };
        setEvents((prev) => [ev, ...prev].slice(0, MAX_FEED));
        schedule();
      }, wait);
    }
    schedule();
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, []);

  const handleComplete = useCallback(
    (loggedMinutes: number) => {
      if (completedToday) return;
      setCompletedToday(true);
      setStreak((s) => s + 1);
      setCadence((prev) =>
        prev.map((d, i) =>
          i === prev.length - 1 ? { ...d, state: "complete" as const } : d,
        ),
      );
      setEvents((prev) => [
        {
          id: `you-complete-${Date.now()}`,
          name: "You",
          action: `marked Day ${mockCycle.day} — ${loggedMinutes} min logged.`,
          timeAgo: "just now",
          fresh: true,
        },
        ...prev,
      ].slice(0, MAX_FEED));

      // Persist locally so streak/progress survives reload — and so the
      // profile/settings pages can read it later. No network calls.
      store.bumpStreak();
      store.logMinutes(loggedMinutes);
      store.appendFieldLog({
        id: `entry-${Date.now()}`,
        cycleCode: mockCycle.cycleCode,
        day: mockCycle.day,
        minutes: loggedMinutes,
        note: "Marked complete from dashboard.",
        loggedAtIso: new Date().toISOString(),
      });
    },
    [completedToday],
  );

  const handleObjectiveToggle = useCallback(
    (objective: { id: string; label: string }, nowDone: boolean) => {
      if (!nowDone) return; // only log completions
      setEvents((prev) => [
        {
          id: `you-obj-${objective.id}-${Date.now()}`,
          name: "You",
          action: `completed an objective: "${objective.label.split(".")[0]}".`,
          timeAgo: "just now",
          fresh: true,
          highlight: true,
        },
        ...prev,
      ].slice(0, MAX_FEED));

      store.appendFieldLog({
        id: `obj-${objective.id}-${Date.now()}`,
        cycleCode: mockCycle.cycleCode,
        day: mockCycle.day,
        minutes: 0,
        note: `Objective complete: ${objective.label}`,
        loggedAtIso: new Date().toISOString(),
      });
    },
    [],
  );

  const directiveProps = useMemo(
    () => ({ ...mockDirective, completed: completedToday, onComplete: handleComplete }),
    [completedToday, handleComplete],
  );

  return (
    <>
      <CycleStrip
        cycleCode={mockCycle.cycleCode}
        cycleName={mockCycle.cycleName}
        day={mockCycle.day}
        totalDays={mockCycle.totalDays}
        startedAt={mockCycle.startedAt}
        operativeHandle={handle}
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-5 py-7 md:gap-7 md:px-10 md:py-9 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <TodayDirective {...directiveProps} />
        </div>

        <aside className="lg:col-span-4">
          <SquadActivity squadName={mockSquadName} events={events} />
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
