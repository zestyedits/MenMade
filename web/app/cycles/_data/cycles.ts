import type { FocusArea, Intensity } from "../../lib/store";

export type CycleLength = 14 | 30 | 60 | 90;

export type CycleTemplate = {
  code: string;
  name: string;
  focus: FocusArea;
  length: CycleLength;
  intensity: Intensity;
  summary: string; // one-line, dry
  brief: string; // paragraph, what the cycle actually demands
  objectives: string[]; // what "done" looks like
  author: string;
  runsCount: number; // squads that have run this
  closeRate: number; // 0-100
  featured?: boolean;
};

export const CYCLES: CycleTemplate[] = [
  {
    code: "P-001",
    name: "Build something that breathes",
    focus: "build",
    length: 30,
    intensity: "steady",
    summary: "Ship one real object you can put on a shelf.",
    brief:
      "Thirty days. One project, hands-on. Wood, metal, code, whatever. You can name it on Day 1, you can finish it by Day 30, or you can ghost the cycle and your squad will notice.",
    objectives: [
      "Pick a finishable project and post it Day 01",
      "Forty-five focused minutes a day, six days a week",
      "Submit weekly photo evidence to the squad",
      "Finish the thing. No half-completes.",
    ],
    author: "MenMade staff",
    runsCount: 1247,
    closeRate: 84,
    featured: true,
  },
  {
    code: "P-002",
    name: "Iron foundations",
    focus: "move",
    length: 30,
    intensity: "heavy",
    summary: "Five lifts, five sets, five days a week.",
    brief:
      "The squat, deadlift, bench, overhead press, and row. Linear progression on every lift. You hit the gym five days a week. The squad sees the weight on the bar.",
    objectives: [
      "Establish working sets at 80% on Day 03",
      "Add weight on every lift, every week",
      "Log all sets to the field log",
      "Show a Day 30 lift video to the squad",
    ],
    author: "Squad 047 / Rafa Ortiz",
    runsCount: 892,
    closeRate: 79,
  },
  {
    code: "P-003",
    name: "The morning page",
    focus: "make",
    length: 30,
    intensity: "light",
    summary: "750 words a day before the world starts talking.",
    brief:
      "Wake up, sit down, write 750 words. Anything. The point is the discipline, not the quality. Phone off. No editing during the cycle.",
    objectives: [
      "Daily 750-word entry by 09:00 local",
      "No editing during the cycle — drafts only",
      "Weekly squad share of one paragraph",
      "End the cycle with 22,500 words on the page",
    ],
    author: "Squad 198 / Owen Briggs",
    runsCount: 643,
    closeRate: 91,
  },
  {
    code: "P-004",
    name: "Phone in the kitchen",
    focus: "master",
    length: 14,
    intensity: "steady",
    summary: "Deep work before the dopamine.",
    brief:
      "Two weeks. Two hours of phone-free focused work every morning before opening any app. Brutal at first. The squad keeps you accountable. By Day 10 you'll wonder what you did with all the lost hours.",
    objectives: [
      "Phone in another room before sunrise",
      "Two clean hours of focused work, six days a week",
      "Log start and stop times to the field log",
      "Survey at Day 14 — what did you actually build?",
    ],
    author: "MenMade staff",
    runsCount: 2104,
    closeRate: 88,
  },
  {
    code: "P-005",
    name: "Ship a side project",
    focus: "build",
    length: 90,
    intensity: "heavy",
    summary: "Launch it. Even badly.",
    brief:
      "Ninety days. One project you've been putting off. By Day 90 it ships — public, named, with a URL or a product. Doesn't have to be successful; has to be shipped.",
    objectives: [
      "Define scope and ship target on Day 07",
      "Daily build log to the squad",
      "Internal alpha by Day 60",
      "Public launch by Day 90",
    ],
    author: "Squad 311 / Tomás Reinholt",
    runsCount: 528,
    closeRate: 71,
    featured: true,
  },
  {
    code: "P-006",
    name: "Half marathon — first time",
    focus: "move",
    length: 60,
    intensity: "steady",
    summary: "Thirteen miles end to end.",
    brief:
      "Sixty days of structured training. Three runs a week, building from your current base to 13.1 miles. Squad sees every run. Day 60 is race day or a logged solo half.",
    objectives: [
      "Submit baseline 5k time on Day 03",
      "Three runs a week, long run building each Sunday",
      "10-mile run by Day 45",
      "Complete 13.1 miles by Day 60",
    ],
    author: "Squad 142 / Eitan Voss",
    runsCount: 411,
    closeRate: 76,
  },
  {
    code: "P-007",
    name: "Ninety days dry",
    focus: "master",
    length: 90,
    intensity: "heavy",
    summary: "The streak the squad watches.",
    brief:
      "No alcohol for 90 days. Daily check-in. If you miss, you tell the squad why. No grand transformation pitch — just the streak, the squad, and a clean reset.",
    objectives: [
      "Daily check-in, every day, no skips",
      "Replace any habitual drinking trigger with a logged alternative",
      "Weekly debrief — what got hard, what got easier",
      "Day 90 — write one paragraph on what changed",
    ],
    author: "MenMade staff",
    runsCount: 1893,
    closeRate: 68,
  },
  {
    code: "P-008",
    name: "Restoration",
    focus: "mend",
    length: 90,
    intensity: "steady",
    summary: "Fix one thing that's broken. Finish before season change.",
    brief:
      "Restore something physical — a piece of furniture, a car, a tool, a room. Ninety days. The squad gets photo proof at each stage. Most squads use this to finish projects that have been waiting two years.",
    objectives: [
      "Pick the project and post baseline photos on Day 01",
      "Weekly progress photos to the field log",
      "Document materials, time, lessons",
      "Final reveal by Day 90",
    ],
    author: "Squad 022 / Devan Okafor",
    runsCount: 287,
    closeRate: 82,
  },
  {
    code: "P-009",
    name: "Fasted mornings",
    focus: "move",
    length: 30,
    intensity: "steady",
    summary: "Twelve hours before the first bite.",
    brief:
      "Thirty days of 12-hour overnight fasts. Eat dinner by 19:00, no food before 07:00. Squad logs first-meal time daily. Coffee allowed. Lying allowed but not recommended.",
    objectives: [
      "Last meal logged by 19:00 daily",
      "First meal no earlier than 07:00",
      "Weekly weigh-in to the field log",
      "End-of-cycle reflection on energy + sleep",
    ],
    author: "Squad 088 / Kai Thompson",
    runsCount: 1056,
    closeRate: 85,
  },
  {
    code: "P-010",
    name: "The reading discipline",
    focus: "master",
    length: 60,
    intensity: "light",
    summary: "Thirty pages a day. One book per fortnight.",
    brief:
      "Sixty days. Four books, your choice. Thirty pages a day, logged with page numbers. Squad shares a sentence at end of each book. Phones stay out of the reading window.",
    objectives: [
      "Pick four books before Day 03",
      "Log page numbers daily",
      "One book finished every 15 days",
      "End-of-cycle review: rate each book to the squad",
    ],
    author: "Squad 311 / Luca Romano",
    runsCount: 738,
    closeRate: 89,
  },
  {
    code: "P-011",
    name: "Lift bodyweight × 1.5",
    focus: "move",
    length: 90,
    intensity: "brutal",
    summary: "Deadlift 1.5× your weight, on video.",
    brief:
      "Ninety days. Linear progression on the deadlift to bodyweight × 1.5. Five sessions a week, two compound lifts per session. Submit a successful lift video by Day 90. Squad fact-checks form.",
    objectives: [
      "Baseline deadlift max on Day 03",
      "Five sessions a week, two compounds per session",
      "Weekly working-set videos to the squad",
      "1.5× bodyweight deadlift video by Day 90",
    ],
    author: "Squad 047 / Marcus Vega",
    runsCount: 196,
    closeRate: 63,
  },
  {
    code: "P-012",
    name: "Thirty days of runway",
    focus: "build",
    length: 90,
    intensity: "steady",
    summary: "One month of expenses, saved, before year-end.",
    brief:
      "Ninety days to bank one full month of your living expenses. Squad sees weekly numbers (anonymized if you want). Cuts decided by you; pace enforced by the squad.",
    objectives: [
      "Submit baseline monthly expense number by Day 03",
      "Weekly savings transfer logged to the field log",
      "Squad reviews progress at Days 30, 60, 90",
      "Hit the target — full month banked",
    ],
    author: "MenMade staff",
    runsCount: 824,
    closeRate: 74,
  },
];

export function getCycle(code: string): CycleTemplate | undefined {
  return CYCLES.find((c) => c.code === code);
}

export const FOCUS_LABELS: Record<FocusArea, string> = {
  build: "Build",
  move: "Move",
  make: "Make",
  master: "Master",
  mend: "Mend",
  mark: "Mark",
};

export const INTENSITY_LABELS: Record<Intensity, string> = {
  light: "Light",
  steady: "Steady",
  heavy: "Heavy",
  brutal: "Brutal",
};

export const INTENSITY_DOTS: Record<Intensity, number> = {
  light: 1,
  steady: 2,
  heavy: 4,
  brutal: 5,
};
