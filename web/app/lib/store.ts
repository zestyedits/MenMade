"use client";

// Local-only personal data store. Lives entirely in the user's browser
// (localStorage) until/unless they explicitly opt into a squad and the data
// is synced to a server. No analytics SDKs, no ad pixels, no third-party
// tracking. Everything written here is something the user can see, export,
// or wipe from /settings.

const VERSION = 1;
const NS = `menmade.v${VERSION}`;

// ---------- Types ----------

export type FocusArea = "build" | "move" | "make" | "master" | "mend" | "mark";
export type Intensity = "light" | "steady" | "heavy" | "brutal";
export type SquadStyle = "matched" | "invite" | "solo";

export type Preferences = {
  focus: FocusArea[];
  intensity: Intensity;
  daysPerWeek: 4 | 5 | 6 | 7;
  squadStyle: SquadStyle;
  timezone: string;
};

export type Identity = {
  handle: string;
  displayName: string;
  pronouns?: string;
};

export type Progress = {
  currentCycleCode: string | null;
  currentCycleDay: number;
  /** ISO timestamp of when the current cycle was started — drives the
   *  CycleStrip "elapsed" counter and decay logic. Null until the user
   *  enrolls in a cycle (typically at onboarding finish). */
  currentCycleStartedAtIso: string | null;
  streak: number;
  cyclesCompleted: number;
  totalMinutesLogged: number;
  lastCheckInIso: string | null;
};

export type FieldLogEntry = {
  id: string;
  cycleCode: string;
  day: number;
  minutes: number;
  note: string;
  loggedAtIso: string;
};

export type ChatReaction = "+1" | "lol" | "fact" | "cope";

export type ChatMessage = {
  id: string;
  authorHandle: string;
  authorName: string;
  body: string;
  sentAtIso: string;
  reactions?: Partial<Record<ChatReaction, number>>;
  /** Optional stamp attachment — curated visual reaction (replaces body when present). */
  stampId?: string;
  /** Server-side warn flag for soft moderation (e.g., heated personal attack). */
  softFlagged?: boolean;
  /** Server-side block flag for hard moderation (slurs, threats, illegal content). */
  hardBlocked?: boolean;
};

export type NotificationPrefs = {
  cycleReminder: boolean;
  cycleClose: boolean;
  squadActivity: boolean;
  mentionsOnly: boolean;
  squadLeadAnnouncements: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  push: boolean;
  email: boolean;
};

export type AccessibilityPrefs = {
  reduceMotion: "system" | "always" | "never";
  textSize: "sm" | "md" | "lg";
  density: "compact" | "comfortable";
  keyboardHints: boolean;
};

export type PrivacyPrefs = {
  marketingEmails: boolean; // default off
  productUpdateEmails: boolean; // transactional product news, default on
  shareSquadActivity: boolean; // future: cross-squad activity feed; default off
};

export type SafetyPrefs = {
  softFlaggedVisibility: "show" | "collapse" | "hide";
};

export type Plan = "free" | "operator-monthly" | "operator-annual" | "founder";

export type Subscription = {
  plan: Plan;
  /** ISO date — when this plan started (for trial/proration logic later). */
  startedAtIso: string | null;
  /** ISO date — next billing date for monthly/annual; null for free/founder. */
  renewsAtIso: string | null;
  /** Was the user a Founder? Persists even if they hypothetically sold the seat. */
  founderSeatNumber: number | null;
};

// ---------- Defaults ----------

export const defaultPreferences: Preferences = {
  focus: [],
  intensity: "steady",
  daysPerWeek: 6,
  squadStyle: "matched",
  timezone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC",
};

export const defaultProgress: Progress = {
  currentCycleCode: null,
  currentCycleDay: 0,
  currentCycleStartedAtIso: null,
  streak: 0,
  cyclesCompleted: 0,
  totalMinutesLogged: 0,
  lastCheckInIso: null,
};

export const defaultNotifications: NotificationPrefs = {
  cycleReminder: true,
  cycleClose: true,
  squadActivity: true,
  mentionsOnly: false,
  squadLeadAnnouncements: true,
  dailyDigest: false,
  weeklyDigest: true,
  push: true,
  email: true,
};

export const defaultAccessibility: AccessibilityPrefs = {
  reduceMotion: "system",
  textSize: "md",
  density: "comfortable",
  keyboardHints: false,
};

export const defaultPrivacy: PrivacyPrefs = {
  marketingEmails: false,
  productUpdateEmails: true,
  shareSquadActivity: false,
};

export const defaultSafety: SafetyPrefs = {
  softFlaggedVisibility: "collapse",
};

export const defaultSubscription: Subscription = {
  plan: "free",
  startedAtIso: null,
  renewsAtIso: null,
  founderSeatNumber: null,
};

// Founder's Pass cap. Real number, real scarcity. When the live count hits
// FOUNDER_PASS_CAP, the tier removes itself from public pricing and the
// pricing page surfaces a waitlist instead.
export const FOUNDER_PASS_CAP = 500;
// Seed for the publicly-displayed "claimed" counter. UI-first uses this
// number; real impl reads from a server endpoint that increments on each
// successful Founder's Pass purchase.
export const FOUNDER_PASS_SEED_CLAIMED = 87;

// ---------- Generic helpers ----------

function key(k: string) {
  return `${NS}.${k}`;
}

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key(k));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(k), JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent("menmade:store-change", { detail: { key: k } }),
    );
  } catch {
    // quota exceeded or storage disabled — silent
  }
}

// ---------- Public API ----------

export const store = {
  // Preferences (interests / matching)
  getPreferences: (): Preferences => read("preferences", defaultPreferences),
  setPreferences: (p: Preferences) => write("preferences", p),
  hasOnboarded: (): boolean => read<boolean>("onboarded", false),
  markOnboarded: () => write("onboarded", true),

  // Identity (handle, display name, pronouns)
  getIdentity: (): Identity | null => read("identity", null),
  setIdentity: (i: Identity) => write("identity", i),

  // Progress (streak, cycle day, cycles completed)
  getProgress: (): Progress => read("progress", defaultProgress),
  setProgress: (p: Progress) => write("progress", p),
  bumpStreak: () => {
    const p = read("progress", defaultProgress);
    write("progress", {
      ...p,
      streak: p.streak + 1,
      lastCheckInIso: new Date().toISOString(),
    });
  },
  logMinutes: (mins: number) => {
    const p = read("progress", defaultProgress);
    write("progress", { ...p, totalMinutesLogged: p.totalMinutesLogged + mins });
  },

  // Field log (user's personal entries)
  getFieldLog: (): FieldLogEntry[] => read("fieldLog", []),
  appendFieldLog: (entry: FieldLogEntry) => {
    const list = read<FieldLogEntry[]>("fieldLog", []);
    write("fieldLog", [entry, ...list].slice(0, 500));
  },

  // Chat — squad chat is the only surface where local-only sync is
  // insufficient (see project_chat_moderation memory). For UI-first work
  // we still cache locally; real sync replaces these reads later.
  // Messages are keyed by squad callsign so the user can be in multiple
  // squads (capped at 3 by project design) without their threads colliding.
  getChatMessages: (callsign: string): ChatMessage[] =>
    read(`chatMessages.${callsign}`, []),
  setChatMessages: (callsign: string, msgs: ChatMessage[]) =>
    write(`chatMessages.${callsign}`, msgs.slice(-500)),
  getActiveSquad: (): string | null => read<string | null>("activeSquad", null),
  setActiveSquad: (callsign: string) => write("activeSquad", callsign),

  // Block list — hides every message from a handle across all squads.
  getBlockedHandles: (): string[] => read("blockedHandles", []),
  blockHandle: (handle: string) => {
    const list = read<string[]>("blockedHandles", []);
    if (!list.includes(handle)) write("blockedHandles", [...list, handle]);
  },
  unblockHandle: (handle: string) => {
    const list = read<string[]>("blockedHandles", []);
    write(
      "blockedHandles",
      list.filter((h) => h !== handle),
    );
  },
  isBlocked: (handle: string) =>
    read<string[]>("blockedHandles", []).includes(handle),

  // Reports — locally tracked here; real implementation logs immutably to
  // a server-side mod queue for the App Store appeals trail. Keyed per
  // squad so the dropdown can show "Reported" state for the right thread.
  getReportedMessageIds: (callsign: string): string[] =>
    read(`reportedMessageIds.${callsign}`, []),
  reportMessage: (callsign: string, messageId: string) => {
    const list = read<string[]>(`reportedMessageIds.${callsign}`, []);
    if (!list.includes(messageId))
      write(`reportedMessageIds.${callsign}`, [...list, messageId]);
  },

  // Code-of-conduct banner dismissal.
  hasAcknowledgedChatCOC: (): boolean => read("chatCOCAcked", false),
  acknowledgeChatCOC: () => write("chatCOCAcked", true),

  // Notification / accessibility / privacy / safety preferences. Each
  // returns a complete object merged onto the defaults so a stale stored
  // shape never breaks the UI.
  getNotifications: (): NotificationPrefs => ({
    ...defaultNotifications,
    ...read<Partial<NotificationPrefs>>("notifications", {}),
  }),
  setNotifications: (p: NotificationPrefs) => write("notifications", p),

  getAccessibility: (): AccessibilityPrefs => ({
    ...defaultAccessibility,
    ...read<Partial<AccessibilityPrefs>>("accessibility", {}),
  }),
  setAccessibility: (p: AccessibilityPrefs) => write("accessibility", p),

  getPrivacy: (): PrivacyPrefs => ({
    ...defaultPrivacy,
    ...read<Partial<PrivacyPrefs>>("privacy", {}),
  }),
  setPrivacy: (p: PrivacyPrefs) => write("privacy", p),

  getSafety: (): SafetyPrefs => ({
    ...defaultSafety,
    ...read<Partial<SafetyPrefs>>("safety", {}),
  }),
  setSafety: (p: SafetyPrefs) => write("safety", p),

  getSubscription: (): Subscription => ({
    ...defaultSubscription,
    ...read<Partial<Subscription>>("subscription", {}),
  }),
  setSubscription: (p: Subscription) => write("subscription", p),

  // Hard reset — exposed via /settings → "Delete everything"
  wipeAll: () => {
    if (typeof window === "undefined") return;
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`${NS}.`)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("menmade:store-change", { detail: { key: "*" } }));
  },

  // Export — exposed via /settings → "Export everything"
  exportAll: () => ({
    version: VERSION,
    exportedAtIso: new Date().toISOString(),
    preferences: read("preferences", defaultPreferences),
    identity: read("identity", null),
    progress: read("progress", defaultProgress),
    fieldLog: read<FieldLogEntry[]>("fieldLog", []),
    onboarded: read<boolean>("onboarded", false),
  }),
};
