# Settings · Accessibility — `/settings/accessibility`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Per-account accessibility controls: motion, text size, layout density, keyboard navigation (+ shortcut reference), and assistive-tech notes.

## How it looks today
- **01 / Motion — "Reduce motion":** RadioGroup — Match my system (recommended) / Always reduce / Never reduce.
- **02 / Type — "Text size":** RadioGroup — Small (13px) / Medium (15px, default) / Large (17px).
- **03 / Layout — "Density":** RadioGroup — Comfortable (default) / Compact.
- **04 / Keyboard — "Keyboard navigation":** a "Show keyboard shortcut hints" toggle + a `divide-y` reference table of 6 shortcuts rendered with styled `<kbd>` glyphs (Enter / Shift+Enter / Esc / Tab / Shift+Tab / `/`).
- **05 / Screen readers — "Assistive tech":** a list of tested readers (VoiceOver / TalkBack / NVDA·JAWS) + a "report an a11y bug" contact line (*"We treat accessibility bugs as ship-blocking."*).

Auto-saves on change (*"Changes save as you adjust." / "Saved."*). Uses `Section`, `RadioGroup`, `Toggle`, `<kbd>`.

## Redesign goals
- The accessibility page must itself be exemplary: large legible controls, obvious focus, and the live preview implication of text-size/density choices.
- The shortcut reference should read as a clean instrument legend with proper `<kbd>` styling.

## The prompt (paste into Lovable)

> Redesign the **Accessibility** settings sub-page for MenMade inside the shared settings shell (brand rules
> in `00-BRAND-SYSTEM.md`; sectioned with `border-t`). This page must itself be exemplary accessibility —
> large legible controls, unmistakable focus states, generous targets. Sections: **01 Motion ("Reduce
> motion")** — a radio group of Match my system (recommended) / Always reduce / Never reduce; **02 Type ("Text
> size")** — Small / Medium (default) / Large; **03 Layout ("Density")** — Comfortable / Compact; **04 Keyboard
> ("Keyboard navigation")** — a "Show keyboard shortcut hints" toggle plus a `divide-y` **shortcut reference**
> rendered as a clean instrument legend with styled `<kbd>` glyphs (Enter, Shift+Enter, Esc, Tab, Shift+Tab,
> `/`); **05 Screen readers ("Assistive tech")** — a list of tested readers (VoiceOver, TalkBack, NVDA/JAWS)
> and a "report an a11y bug" contact line (*"We treat accessibility bugs as ship-blocking."*). Settings
> **auto-save** with a *"Changes save as you adjust." / "Saved."* footer. Mobile-first, full keyboard nav,
> proper radio/switch/kbd semantics, WCAG 2.2 AA.
