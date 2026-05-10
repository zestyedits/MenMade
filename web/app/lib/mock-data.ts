import type { ActivityEvent } from "../dashboard/_sections/SquadActivity";
import type { Objective } from "../dashboard/_sections/CycleObjectives";

export const mockCycle = {
  cycleCode: "P-014",
  cycleName: "Build something that breathes",
  day: 12,
  totalDays: 30,
  startedAt: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 12);
    d.setHours(7, 12, 0, 0);
    return d.toISOString();
  })(),
};

// Pool of plausible squad events that drip in over time. The dashboard
// picks one at random every 25-45 seconds to simulate live activity.
export const simulatedEventPool = [
  {
    name: "Marcus Vega",
    action: "marked Day 12 — 38 min, no excuses logged.",
  },
  {
    name: "Theo Park",
    action: "uploaded photo evidence to the field log.",
  },
  {
    name: "Wes Holloway",
    action: "logged a brief: 'Phone in the kitchen. Two clean hours.'",
  },
  {
    name: "Jonas Reyes",
    action: "started the session timer.",
  },
  {
    name: "Daniel Cho",
    action: "checked in late. Streak intact.",
  },
  {
    name: "Sam Brennan",
    action: "marked Day 12 — 1h 12m on the build.",
  },
  {
    name: "Eli Tanaka",
    action: "added a photo of the joinery. Squad reviewed.",
  },
  {
    name: "Marcus Vega",
    action: "completed an objective: 'Submit weekly photo evidence.'",
    highlight: true,
  },
];

export const mockSquadName = "Bravo Workshop";

export const mockActivity: ActivityEvent[] = [
  {
    id: "a1",
    name: "Marcus Vega",
    action: "marked Day 12 — 42 min on the workbench.",
    timeAgo: "12m ago",
  },
  {
    id: "a2",
    name: "Theo Park",
    action: "logged a brief: 'Frame is square. Sanding next.'",
    timeAgo: "47m ago",
  },
  {
    id: "a3",
    name: "Daniel Cho",
    action: "missed Day 11. Squad notified.",
    timeAgo: "2h ago",
    highlight: true,
  },
  {
    id: "a4",
    name: "Wes Holloway",
    action: "marked Day 12 — 1h 5m, no excuses entered.",
    timeAgo: "3h ago",
  },
  {
    id: "a5",
    name: "Jonas Reyes",
    action: "uploaded photo evidence to the field log.",
    timeAgo: "5h ago",
  },
  {
    id: "a6",
    name: "You",
    action: "joined the cycle. Welcome to the workshop.",
    timeAgo: "12d ago",
  },
];

export const mockObjectives: Objective[] = [
  {
    id: "o1",
    label: "Pick a real, finishable project. Tell the squad in one sentence.",
    due: "Day 02",
    done: true,
  },
  {
    id: "o2",
    label: "Show up six days a week. The seventh is for sleep, not scrolling.",
    due: "Daily",
    done: true,
  },
  {
    id: "o3",
    label: "Submit weekly photo evidence. The squad gets to call BS.",
    due: "Day 07, 14, 21, 28",
    done: false,
  },
  {
    id: "o4",
    label: "Finish the thing. No half-completes, no 'I learned a lot'.",
    due: "Day 30",
    done: false,
  },
];

type DayState = "complete" | "missed" | "pending" | "today" | "future";

function mkDay(offset: number, state: DayState) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return { date: d.toISOString().slice(0, 10), state };
}

export const mockCadence: { date: string; state: DayState }[] = [
  mkDay(-13, "complete"),
  mkDay(-12, "complete"),
  mkDay(-11, "complete"),
  mkDay(-10, "complete"),
  mkDay(-9, "complete"),
  mkDay(-8, "missed"),
  mkDay(-7, "complete"),
  mkDay(-6, "complete"),
  mkDay(-5, "complete"),
  mkDay(-4, "complete"),
  mkDay(-3, "complete"),
  mkDay(-2, "complete"),
  mkDay(-1, "complete"),
  mkDay(0, "today"),
];

export const mockStreak = 6;

export const mockDirective = {
  day: 12,
  directive: "Forty-five focused minutes on the build. Phone in the other room.",
  detail:
    "Today is one of those days where the joinery looks worse before it looks right. Don't quit at the ugly stage. Squad is watching.",
  estimatedMinutes: 45,
};
