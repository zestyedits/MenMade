import type { ChatMessage } from "../../lib/store";

function ago(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export type RosterMember = {
  handle: string;
  name: string;
  role: "lead" | "op";
  online: boolean;
  lastSeenMin: number;
  streak: number;
  tz: string;
};

export type Squad = {
  callsign: string;
  name: string;
  blurb: string; // shown in squad rail
  cycleCode: string;
  cycleDay: number;
  totalDays: number;
  intensity: "LIGHT" | "STEADY" | "HEAVY" | "BRUTAL";
  focus: string; // single-word focus tag for the rail
  roster: RosterMember[];
  seedMessages: ChatMessage[];
  replyPool: { authorHandle: string; authorName: string; body: string }[];
};

// Bravo Workshop — building / making focus, established mid-cycle
const BRAVO: Squad = {
  callsign: "B-04",
  name: "Bravo Workshop",
  blurb: "Build · Make",
  cycleCode: "P-014",
  cycleDay: 12,
  totalDays: 30,
  intensity: "STEADY",
  focus: "Build",
  roster: [
    { handle: "marcus", name: "Marcus Vega", role: "lead", online: true, lastSeenMin: 2, streak: 11, tz: "PST" },
    { handle: "theo", name: "Theo Park", role: "op", online: true, lastSeenMin: 4, streak: 9, tz: "EST" },
    { handle: "wes", name: "Wes Holloway", role: "op", online: true, lastSeenMin: 8, streak: 8, tz: "CST" },
    { handle: "jonas", name: "Jonas Reyes", role: "op", online: false, lastSeenMin: 47, streak: 12, tz: "MST" },
    { handle: "daniel", name: "Daniel Cho", role: "op", online: false, lastSeenMin: 220, streak: 4, tz: "PST" },
  ],
  seedMessages: [
    { id: "B-1", authorHandle: "marcus", authorName: "Marcus Vega", body: "Day 12. Phone in the kitchen. Two clean hours. Done.", sentAtIso: ago(180), reactions: { "+1": 3, fact: 2 } },
    { id: "B-2", authorHandle: "theo", authorName: "Theo Park", body: "Marcus posting at 6:14am like he's running for office.", sentAtIso: ago(174), reactions: { lol: 4 } },
    { id: "B-3", authorHandle: "marcus", authorName: "Marcus Vega", body: "I am running for office. The office of finishing this cycle.", sentAtIso: ago(173), reactions: { "+1": 2, lol: 3 } },
    { id: "B-4", authorHandle: "wes", authorName: "Wes Holloway", body: "Daniel still missing. Squad is concerned. Or at least entertained.", sentAtIso: ago(95) },
    { id: "B-5", authorHandle: "daniel", authorName: "Daniel Cho", body: "I'm here. Alive. The week ate me. Logging 30 tonight.", sentAtIso: ago(48), reactions: { "+1": 4 } },
    { id: "B-6", authorHandle: "jonas", authorName: "Jonas Reyes", body: "30 minutes is still 30 more than yesterday. Run it.", sentAtIso: ago(46), reactions: { fact: 5 } },
    { id: "B-7", authorHandle: "theo", authorName: "Theo Park", body: "Frame is square. Sanding next. Photo dropping in the field log.", sentAtIso: ago(22), reactions: { "+1": 2 } },
    { id: "B-7s", authorHandle: "marcus", authorName: "Marcus Vega", body: "", stampId: "receipts", sentAtIso: ago(20) },
    { id: "B-8", authorHandle: "wes", authorName: "Wes Holloway", body: "Took an hour off the phone. World did not end. Concerning. 🫡", sentAtIso: ago(8), reactions: { lol: 2 } },
  ],
  replyPool: [
    { authorHandle: "marcus", authorName: "Marcus Vega", body: "Logged. Squad sees you." },
    { authorHandle: "theo", authorName: "Theo Park", body: "Acknowledged. Suspicious of the speed though." },
    { authorHandle: "wes", authorName: "Wes Holloway", body: "Show evidence or it didn't happen." },
    { authorHandle: "jonas", authorName: "Jonas Reyes", body: "+1. Keep going." },
    { authorHandle: "daniel", authorName: "Daniel Cho", body: "Roasted. But fair." },
    { authorHandle: "marcus", authorName: "Marcus Vega", body: "Beat me by 4 minutes. Calling it sabotage." },
    { authorHandle: "theo", authorName: "Theo Park", body: "Photo or it's vibes." },
  ],
};

// Alpha Iron — fitness / move focus, early cycle, intense
const ALPHA: Squad = {
  callsign: "A-12",
  name: "Alpha Iron",
  blurb: "Move · Fitness",
  cycleCode: "P-022",
  cycleDay: 6,
  totalDays: 14,
  intensity: "HEAVY",
  focus: "Move",
  roster: [
    { handle: "rafa", name: "Rafa Ortiz", role: "lead", online: true, lastSeenMin: 1, streak: 6, tz: "EST" },
    { handle: "kai", name: "Kai Thompson", role: "op", online: true, lastSeenMin: 14, streak: 5, tz: "PST" },
    { handle: "elias", name: "Elias Brand", role: "op", online: false, lastSeenMin: 90, streak: 6, tz: "GMT" },
    { handle: "noah", name: "Noah Sato", role: "op", online: false, lastSeenMin: 320, streak: 3, tz: "JST" },
  ],
  seedMessages: [
    { id: "A-1", authorHandle: "rafa", authorName: "Rafa Ortiz", body: "Day 6. Five sets of five at 80%. Form held. Bar didn't.", sentAtIso: ago(420), reactions: { "+1": 3 } },
    { id: "A-2", authorHandle: "kai", authorName: "Kai Thompson", body: "Bar didn't WHAT, Rafa. Don't leave us hanging.", sentAtIso: ago(418), reactions: { lol: 3 } },
    { id: "A-3", authorHandle: "rafa", authorName: "Rafa Ortiz", body: "Sleeve came loose mid-set. Cleaned the rack. Moving on.", sentAtIso: ago(417) },
    { id: "A-4", authorHandle: "elias", authorName: "Elias Brand", body: "Four miles before sunrise. Hands numb. Recommended.", sentAtIso: ago(180), reactions: { fact: 2, "+1": 2 } },
    { id: "A-5", authorHandle: "noah", authorName: "Noah Sato", body: "Time zone gap means I'm always last to log. Try to keep up.", sentAtIso: ago(35), reactions: { lol: 2 } },
    { id: "A-6", authorHandle: "kai", authorName: "Kai Thompson", body: "Noah lapping us by going to bed. Strategic.", sentAtIso: ago(31), reactions: { lol: 3 } },
  ],
  replyPool: [
    { authorHandle: "rafa", authorName: "Rafa Ortiz", body: "Form check on rep 4. Pin it." },
    { authorHandle: "kai", authorName: "Kai Thompson", body: "Done. Eating. Don't talk to me." },
    { authorHandle: "elias", authorName: "Elias Brand", body: "Rest day. Earned it. Still moved 5k easy." },
    { authorHandle: "noah", authorName: "Noah Sato", body: "Logged. Sleeping. Goodbye Eastern hemisphere." },
  ],
};

// Echo Drafts — write / make focus, late cycle, light
const ECHO: Squad = {
  callsign: "E-03",
  name: "Echo Drafts",
  blurb: "Write · Make",
  cycleCode: "P-033",
  cycleDay: 19,
  totalDays: 30,
  intensity: "LIGHT",
  focus: "Make",
  roster: [
    { handle: "owen", name: "Owen Briggs", role: "lead", online: false, lastSeenMin: 30, streak: 17, tz: "PST" },
    { handle: "luca", name: "Luca Romano", role: "op", online: true, lastSeenMin: 6, streak: 19, tz: "CET" },
    { handle: "yusef", name: "Yusef Karim", role: "op", online: false, lastSeenMin: 720, streak: 12, tz: "GMT+3" },
  ],
  seedMessages: [
    { id: "E-1", authorHandle: "owen", authorName: "Owen Briggs", body: "Day 19. Cut 600 words. Whole chapter is meaner now.", sentAtIso: ago(1440), reactions: { "+1": 2, fact: 1 } },
    { id: "E-2", authorHandle: "luca", authorName: "Luca Romano", body: "Cut 600. Replaced with 800. Net negative achievement.", sentAtIso: ago(1430), reactions: { lol: 2 } },
    { id: "E-3", authorHandle: "yusef", authorName: "Yusef Karim", body: "Both of you have written more this week than I have this month. Filing belongs in the squad.", sentAtIso: ago(800), reactions: { fact: 3 } },
    { id: "E-4", authorHandle: "owen", authorName: "Owen Briggs", body: "Yusef I see you. Day 12 you ghosted. Catch up or get cut.", sentAtIso: ago(60), reactions: { lol: 2 } },
  ],
  replyPool: [
    { authorHandle: "owen", authorName: "Owen Briggs", body: "Filed. Bad. Will rewrite tomorrow." },
    { authorHandle: "luca", authorName: "Luca Romano", body: "Two paragraphs. Both terrible. Counts." },
    { authorHandle: "yusef", authorName: "Yusef Karim", body: "Showing up. Hate it. Posting anyway." },
  ],
};

export const SQUADS: Squad[] = [BRAVO, ALPHA, ECHO];

// User's active squad memberships. In a real impl this comes from the API.
// Cap is 3 (per project design).
export const MY_SQUAD_CALLSIGNS = ["B-04", "A-12", "E-03"];

export function getSquad(callsign: string): Squad | undefined {
  return SQUADS.find((s) => s.callsign === callsign);
}

export function mySquads(): Squad[] {
  return MY_SQUAD_CALLSIGNS
    .map((cs) => SQUADS.find((s) => s.callsign === cs))
    .filter((s): s is Squad => Boolean(s));
}

export const REACTIONS: { id: "+1" | "lol" | "fact" | "cope"; label: string }[] =
  [
    { id: "+1", label: "+1" },
    { id: "lol", label: "lol" },
    { id: "fact", label: "fact" },
    { id: "cope", label: "cope" },
  ];

// Re-export the original roster for the existing roster rail so it
// still type-checks against the message author lookup.
// (Roster passes the active squad's roster now.)
export const SQUAD_ROSTER = BRAVO.roster.concat(ALPHA.roster).concat(ECHO.roster);
