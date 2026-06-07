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

export const mockDirective = {
  day: 12,
  directive: "Forty-five focused minutes on the build. Phone in the other room.",
  detail:
    "Today is one of those days where the joinery looks worse before it looks right. Don't quit at the ugly stage. Squad is watching.",
  estimatedMinutes: 45,
};
