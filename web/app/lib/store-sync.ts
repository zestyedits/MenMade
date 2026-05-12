"use client";

import { createClient } from "./supabase/client";
import {
  defaultAccessibility,
  defaultNotifications,
  defaultPreferences,
  defaultPrivacy,
  defaultProgress,
  defaultSafety,
  type AccessibilityPrefs,
  type FieldLogEntry,
  type Identity,
  type NotificationPrefs,
  type Preferences,
  type PrivacyPrefs,
  type Progress,
  type SafetyPrefs,
} from "./store";

/**
 * Store sync layer.
 *
 * The local store ([web/app/lib/store.ts](web/app/lib/store.ts)) writes
 * to localStorage and emits a `menmade:store-change` CustomEvent on every
 * write. This module listens for those events and pushes the change up
 * to Supabase. It also hydrates server state into localStorage on sign-in.
 *
 * Design choices:
 *   - localStorage is the FAST READ PATH. All synchronous store.get*()
 *     calls keep working unchanged.
 *   - Server is the SOURCE OF TRUTH. On sign-in we hydrate localStorage
 *     from the server, overwriting any stale local state.
 *   - Writes are fire-and-forget. If the network is offline, the local
 *     write still succeeds; the user just won't see it on another device
 *     until they're back online. (Real conflict resolution = Phase 4.)
 *
 * Phase 1 syncs: profile, preferences (incl. onboarded flag), progress,
 * field log entries, notification/accessibility/privacy/safety prefs,
 * blocked handles.
 *
 * Out of scope for Phase 1:
 *   - chat messages (Phase 3 has its own realtime sync)
 *   - reports (Phase 3)
 *   - subscription (Phase 2; webhook is the source of truth)
 *   - activeSquad, chatCOCAcked (per-device UI state — local only)
 */

const NS = "menmade.v1";

// Map localStorage key → server-sync handler.
type Handler = () => Promise<void>;

let initialized = false;
let cleanupFn: (() => void) | null = null;

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${NS}.${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${NS}.${key}`, JSON.stringify(value));
  } catch {
    // quota exceeded
  }
}

// ---------- Per-key sync handlers (push local → server) ----------

async function syncIdentity(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const id = readLocal<Identity | null>("identity", null);
  if (!id) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      handle: id.handle,
      display_name: id.displayName,
      pronouns: id.pronouns ?? null,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.warn("[store-sync] profile upsert failed:", error.message);
  }
}

async function syncPreferences(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const p = readLocal<Preferences>("preferences", defaultPreferences);

  const { error } = await supabase.from("preferences").upsert(
    {
      user_id: user.id,
      focus: p.focus,
      intensity: p.intensity,
      days_per_week: p.daysPerWeek,
      squad_style: p.squadStyle,
      timezone: p.timezone,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] preferences upsert failed:", error.message);
}

async function syncOnboarded(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const onboarded = readLocal<boolean>("onboarded", false);
  const { error } = await supabase
    .from("preferences")
    .update({ onboarded })
    .eq("user_id", user.id);
  if (error) console.warn("[store-sync] onboarded update failed:", error.message);
}

async function syncProgress(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const p = readLocal<Progress>("progress", defaultProgress);

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: user.id,
      current_cycle_code: p.currentCycleCode,
      current_cycle_day: p.currentCycleDay,
      streak: p.streak,
      cycles_completed: p.cyclesCompleted,
      total_minutes_logged: p.totalMinutesLogged,
      last_check_in: p.lastCheckInIso,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] progress upsert failed:", error.message);
}

async function syncFieldLog(): Promise<void> {
  // FieldLog is append-only locally. We push only the most recent entry
  // since pushing the whole array each time is wasteful. The new entry is
  // at index 0 (the store prepends).
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const entries = readLocal<FieldLogEntry[]>("fieldLog", []);
  const newest = entries[0];
  if (!newest) return;

  const { error } = await supabase
    .from("field_log_entries")
    .upsert(
      {
        id: newest.id,
        user_id: user.id,
        cycle_code: newest.cycleCode,
        day: newest.day,
        minutes: newest.minutes,
        note: newest.note,
        logged_at: newest.loggedAtIso,
      },
      { onConflict: "id" },
    );
  if (error) console.warn("[store-sync] field_log insert failed:", error.message);
}

async function syncNotifications(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const n = readLocal<NotificationPrefs>("notifications", defaultNotifications);
  const { error } = await supabase.from("notification_prefs").upsert(
    {
      user_id: user.id,
      cycle_reminder: n.cycleReminder,
      cycle_close: n.cycleClose,
      squad_activity: n.squadActivity,
      mentions_only: n.mentionsOnly,
      squad_lead_announcements: n.squadLeadAnnouncements,
      daily_digest: n.dailyDigest,
      weekly_digest: n.weeklyDigest,
      push: n.push,
      email: n.email,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] notifications upsert failed:", error.message);
}

async function syncAccessibility(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const a = readLocal<AccessibilityPrefs>("accessibility", defaultAccessibility);
  const { error } = await supabase.from("accessibility_prefs").upsert(
    {
      user_id: user.id,
      reduce_motion: a.reduceMotion,
      text_size: a.textSize,
      density: a.density,
      keyboard_hints: a.keyboardHints,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] accessibility upsert failed:", error.message);
}

async function syncPrivacy(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const p = readLocal<PrivacyPrefs>("privacy", defaultPrivacy);
  const { error } = await supabase.from("privacy_prefs").upsert(
    {
      user_id: user.id,
      marketing_emails: p.marketingEmails,
      product_update_emails: p.productUpdateEmails,
      share_squad_activity: p.shareSquadActivity,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] privacy upsert failed:", error.message);
}

async function syncSafety(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const s = readLocal<SafetyPrefs>("safety", defaultSafety);
  const { error } = await supabase.from("safety_prefs").upsert(
    {
      user_id: user.id,
      soft_flagged_visibility: s.softFlaggedVisibility,
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("[store-sync] safety upsert failed:", error.message);
}

async function syncBlockedHandles(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const local = readLocal<string[]>("blockedHandles", []);

  // Reconcile: replace server set with local set.
  await supabase.from("blocked_handles").delete().eq("user_id", user.id);
  if (local.length > 0) {
    const rows = local.map((handle) => ({ user_id: user.id, handle }));
    const { error } = await supabase.from("blocked_handles").insert(rows);
    if (error) console.warn("[store-sync] blocked_handles insert failed:", error.message);
  }
}

const HANDLERS: Record<string, Handler> = {
  identity: syncIdentity,
  preferences: syncPreferences,
  onboarded: syncOnboarded,
  progress: syncProgress,
  fieldLog: syncFieldLog,
  notifications: syncNotifications,
  accessibility: syncAccessibility,
  privacy: syncPrivacy,
  safety: syncSafety,
  blockedHandles: syncBlockedHandles,
};

// Debounce: collapse rapid consecutive writes to the same key into one
// server call. Field log inserts are not debounced (each entry is a row).
const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const DEBOUNCE_MS = 400;

function scheduleSync(key: string) {
  const handler = HANDLERS[key];
  if (!handler) return;

  // FieldLog inserts go through immediately (each entry is a discrete row).
  if (key === "fieldLog") {
    void handler().catch((err) =>
      console.warn(`[store-sync] ${key} threw:`, err),
    );
    return;
  }

  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(() => {
    void handler().catch((err) =>
      console.warn(`[store-sync] ${key} threw:`, err),
    );
    delete debounceTimers[key];
  }, DEBOUNCE_MS);
}

// ---------- Hydration: pull server → local on sign-in ----------

export async function hydrateStoreFromServer(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Read all the user's rows in parallel.
  const [profile, prefs, progress, notif, access, priv, safety, blocks] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("notification_prefs").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("accessibility_prefs").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("privacy_prefs").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("safety_prefs").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("blocked_handles").select("handle").eq("user_id", user.id),
    ]);

  // Identity
  if (profile.data) {
    const id: Identity = {
      handle: profile.data.handle,
      displayName: profile.data.display_name,
      pronouns: profile.data.pronouns ?? undefined,
    };
    writeLocal("identity", id);
  }

  // Preferences + onboarded
  if (prefs.data) {
    const p: Preferences = {
      focus: prefs.data.focus ?? [],
      intensity: prefs.data.intensity,
      daysPerWeek: prefs.data.days_per_week,
      squadStyle: prefs.data.squad_style,
      timezone: prefs.data.timezone,
    };
    writeLocal("preferences", p);
    writeLocal("onboarded", Boolean(prefs.data.onboarded));
  }

  // Progress
  if (progress.data) {
    const p: Progress = {
      currentCycleCode: progress.data.current_cycle_code,
      currentCycleDay: progress.data.current_cycle_day,
      streak: progress.data.streak,
      cyclesCompleted: progress.data.cycles_completed,
      totalMinutesLogged: progress.data.total_minutes_logged,
      lastCheckInIso: progress.data.last_check_in,
    };
    writeLocal("progress", p);
  }

  if (notif.data) {
    writeLocal("notifications", {
      cycleReminder: notif.data.cycle_reminder,
      cycleClose: notif.data.cycle_close,
      squadActivity: notif.data.squad_activity,
      mentionsOnly: notif.data.mentions_only,
      squadLeadAnnouncements: notif.data.squad_lead_announcements,
      dailyDigest: notif.data.daily_digest,
      weeklyDigest: notif.data.weekly_digest,
      push: notif.data.push,
      email: notif.data.email,
    });
  }

  if (access.data) {
    writeLocal("accessibility", {
      reduceMotion: access.data.reduce_motion,
      textSize: access.data.text_size,
      density: access.data.density,
      keyboardHints: access.data.keyboard_hints,
    });
  }

  if (priv.data) {
    writeLocal("privacy", {
      marketingEmails: priv.data.marketing_emails,
      productUpdateEmails: priv.data.product_update_emails,
      shareSquadActivity: priv.data.share_squad_activity,
    });
  }

  if (safety.data) {
    writeLocal("safety", {
      softFlaggedVisibility: safety.data.soft_flagged_visibility,
    });
  }

  if (blocks.data) {
    writeLocal(
      "blockedHandles",
      blocks.data.map((b: { handle: string }) => b.handle),
    );
  }
}

// ---------- Listener bootstrap ----------

type StoreChangeDetail = { key: string };

function handleStoreChangeEvent(event: Event) {
  const e = event as CustomEvent<StoreChangeDetail>;
  const key = e.detail?.key;
  if (!key) return;
  if (key === "*") {
    // wipeAll — nothing to sync, the server-side delete handles it
    return;
  }
  scheduleSync(key);
}

export function startStoreSync(): () => void {
  if (typeof window === "undefined") return () => undefined;
  if (initialized) return cleanupFn ?? (() => undefined);

  window.addEventListener("menmade:store-change", handleStoreChangeEvent);
  initialized = true;
  cleanupFn = () => {
    window.removeEventListener("menmade:store-change", handleStoreChangeEvent);
    initialized = false;
  };
  return cleanupFn;
}
