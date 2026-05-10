// Curated emoji set. Tight intentionally — every entry earns it.
// No party-poppers, no face-with-tears-of-joy, no over-cliche memes.
// Native rendering: Apple users see Apple Color Emoji, others see their
// system set. We don't ship our own emoji art (legal + weight reasons).

export type EmojiCategory = {
  id: string;
  label: string;
  emojis: { glyph: string; name: string }[];
};

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: "signal",
    label: "Signal",
    emojis: [
      { glyph: "✅", name: "check" },
      { glyph: "❌", name: "cross" },
      { glyph: "⚠️", name: "warning" },
      { glyph: "❗", name: "alert" },
      { glyph: "📌", name: "pin" },
      { glyph: "🎯", name: "target" },
      { glyph: "🚩", name: "flag" },
      { glyph: "⏱️", name: "stopwatch" },
      { glyph: "🕐", name: "clock" },
      { glyph: "📍", name: "marker" },
      { glyph: "🔔", name: "bell" },
      { glyph: "🔇", name: "mute" },
    ],
  },
  {
    id: "work",
    label: "Work",
    emojis: [
      { glyph: "🔨", name: "hammer" },
      { glyph: "⚙️", name: "gear" },
      { glyph: "🛠️", name: "tools" },
      { glyph: "📋", name: "clipboard" },
      { glyph: "📊", name: "chart" },
      { glyph: "📈", name: "trend up" },
      { glyph: "💼", name: "briefcase" },
      { glyph: "🧰", name: "toolbox" },
      { glyph: "🪛", name: "screwdriver" },
      { glyph: "⛏️", name: "pick" },
      { glyph: "📝", name: "note" },
      { glyph: "✏️", name: "pencil" },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    emojis: [
      { glyph: "💪", name: "arm" },
      { glyph: "🔥", name: "fire" },
      { glyph: "⚡", name: "bolt" },
      { glyph: "💯", name: "hundred" },
      { glyph: "🏋️", name: "lift" },
      { glyph: "🏃", name: "run" },
      { glyph: "🧗", name: "climb" },
      { glyph: "🥊", name: "boxing" },
      { glyph: "⏳", name: "hourglass" },
      { glyph: "🦵", name: "leg" },
    ],
  },
  {
    id: "tone",
    label: "Tone",
    emojis: [
      { glyph: "🫡", name: "salute" },
      { glyph: "😐", name: "neutral" },
      { glyph: "😏", name: "smirk" },
      { glyph: "😤", name: "huff" },
      { glyph: "🤨", name: "skeptical" },
      { glyph: "🫠", name: "melt" },
      { glyph: "🥲", name: "smile-tear" },
      { glyph: "🫥", name: "dotted" },
      { glyph: "😅", name: "sweat-smile" },
      { glyph: "🤔", name: "think" },
      { glyph: "😶‍🌫️", name: "fog" },
      { glyph: "🫨", name: "shake" },
    ],
  },
  {
    id: "hands",
    label: "Hands",
    emojis: [
      { glyph: "👍", name: "thumbs up" },
      { glyph: "👎", name: "thumbs down" },
      { glyph: "🤝", name: "handshake" },
      { glyph: "🤙", name: "shaka" },
      { glyph: "🙌", name: "raised hands" },
      { glyph: "👏", name: "clap" },
      { glyph: "✊", name: "fist" },
      { glyph: "☝️", name: "point up" },
      { glyph: "👇", name: "point down" },
      { glyph: "🫳", name: "drop" },
    ],
  },
  {
    id: "things",
    label: "Things",
    emojis: [
      { glyph: "📸", name: "camera" },
      { glyph: "📚", name: "books" },
      { glyph: "☕", name: "coffee" },
      { glyph: "🏆", name: "trophy" },
      { glyph: "🥇", name: "gold" },
      { glyph: "📦", name: "box" },
      { glyph: "🪞", name: "mirror" },
      { glyph: "🔒", name: "lock" },
      { glyph: "🧱", name: "brick" },
      { glyph: "🔧", name: "wrench" },
    ],
  },
];

export function searchEmojis(query: string): { glyph: string; name: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  return EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) =>
    e.name.includes(q),
  );
}
