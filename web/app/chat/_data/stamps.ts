import type { Icon } from "@phosphor-icons/react";
import {
  Eye,
  Fire,
  Lightning,
  CheckCircle,
  XCircle,
  ClockCountdown,
  ThumbsUp,
  HandFist,
  Stamp as StampIcon,
  Crosshair,
  Camera,
  Warning,
  ShieldCheck,
  GhostIcon,
  Skull,
  Trophy,
  ChartBar,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";

export type Stamp = {
  id: string;
  label: string;
  subtitle?: string;
  Icon: Icon;
  iconWeight: "regular" | "bold" | "fill" | "duotone";
  /** CSS animation class applied to the icon — defined in globals.css */
  anim: "pulse" | "shake" | "breathe" | "blink" | "spin-slow" | "none";
  tint: "bone" | "ember";
  tags: string[];
};

// Curated set. Every stamp earns its keep — no "haha lol" filler. Deadpan
// utility for accountability chat.
export const STAMPS: Stamp[] = [
  {
    id: "stare",
    label: "Stare",
    subtitle: "I see you",
    Icon: Eye,
    iconWeight: "fill",
    anim: "blink",
    tint: "bone",
    tags: ["sus", "watching", "eye", "side-eye"],
  },
  {
    id: "logged",
    label: "Logged",
    subtitle: "Squad sees it",
    Icon: CheckCircle,
    iconWeight: "fill",
    anim: "pulse",
    tint: "bone",
    tags: ["done", "complete", "marked"],
  },
  {
    id: "receipts",
    label: "Receipts",
    subtitle: "Show evidence",
    Icon: Receipt,
    iconWeight: "regular",
    anim: "none",
    tint: "bone",
    tags: ["proof", "show", "evidence"],
  },
  {
    id: "fact",
    label: "Fact",
    subtitle: "Pinning it",
    Icon: ShieldCheck,
    iconWeight: "fill",
    anim: "none",
    tint: "bone",
    tags: ["true", "agree", "confirmed"],
  },
  {
    id: "roast",
    label: "Roasted",
    subtitle: "Earned",
    Icon: Fire,
    iconWeight: "fill",
    anim: "breathe",
    tint: "ember",
    tags: ["dunk", "burn", "called out"],
  },
  {
    id: "run-it",
    label: "Run it",
    subtitle: "Send the rep",
    Icon: Lightning,
    iconWeight: "fill",
    anim: "pulse",
    tint: "ember",
    tags: ["go", "fire", "send"],
  },
  {
    id: "ghosted",
    label: "Ghosted",
    subtitle: "Day passed quiet",
    Icon: GhostIcon,
    iconWeight: "fill",
    anim: "breathe",
    tint: "bone",
    tags: ["missing", "absent", "no show"],
  },
  {
    id: "cooked",
    label: "Cooked",
    subtitle: "Calling it",
    Icon: Skull,
    iconWeight: "fill",
    anim: "shake",
    tint: "bone",
    tags: ["done", "lost", "mercy"],
  },
  {
    id: "salute",
    label: "Acknowledged",
    subtitle: "Salute",
    Icon: HandFist,
    iconWeight: "fill",
    anim: "none",
    tint: "bone",
    tags: ["salute", "respect", "ack"],
  },
  {
    id: "plus-one",
    label: "+1",
    subtitle: "Backing this",
    Icon: ThumbsUp,
    iconWeight: "fill",
    anim: "none",
    tint: "bone",
    tags: ["agree", "yes", "thumbs up"],
  },
  {
    id: "evidence-needed",
    label: "Show photo",
    subtitle: "Pics or it didn't",
    Icon: Camera,
    iconWeight: "regular",
    anim: "blink",
    tint: "bone",
    tags: ["camera", "proof", "photo"],
  },
  {
    id: "on-target",
    label: "On target",
    subtitle: "Locked in",
    Icon: Crosshair,
    iconWeight: "regular",
    anim: "spin-slow",
    tint: "bone",
    tags: ["aim", "focus", "locked"],
  },
  {
    id: "clock",
    label: "Time check",
    subtitle: "Still on?",
    Icon: ClockCountdown,
    iconWeight: "regular",
    anim: "spin-slow",
    tint: "bone",
    tags: ["time", "deadline", "ping"],
  },
  {
    id: "warning",
    label: "Heads up",
    subtitle: "Squad notice",
    Icon: Warning,
    iconWeight: "fill",
    anim: "blink",
    tint: "ember",
    tags: ["alert", "notice", "watch out"],
  },
  {
    id: "stamp-close",
    label: "Cycle close",
    subtitle: "Day 30 / 30",
    Icon: StampIcon,
    iconWeight: "fill",
    anim: "none",
    tint: "ember",
    tags: ["finish", "done", "complete"],
  },
  {
    id: "rejected",
    label: "Nope",
    subtitle: "Try again",
    Icon: XCircle,
    iconWeight: "fill",
    anim: "shake",
    tint: "bone",
    tags: ["no", "nope", "reject"],
  },
  {
    id: "trophy",
    label: "Earned",
    subtitle: "Cycle PR",
    Icon: Trophy,
    iconWeight: "regular",
    anim: "none",
    tint: "bone",
    tags: ["win", "best", "record"],
  },
  {
    id: "metric",
    label: "Numbers up",
    subtitle: "Receipts attached",
    Icon: ChartBar,
    iconWeight: "fill",
    anim: "none",
    tint: "bone",
    tags: ["data", "numbers", "stats"],
  },
];

export function getStamp(id: string): Stamp | undefined {
  return STAMPS.find((s) => s.id === id);
}

export function searchStamps(query: string): Stamp[] {
  const q = query.trim().toLowerCase();
  if (!q) return STAMPS;
  return STAMPS.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.subtitle?.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q)),
  );
}
