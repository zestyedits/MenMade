# Dashboard — `/dashboard`

## What this page is for
The daily command center for a logged-in user: current cycle status, today's directive with a session timer, squad activity feed, weekly cadence, and cycle objectives.

## How it looks today
- **CycleStrip** (top, if a cycle exists): horizontal bar — live dot, cycle code + name, `@handle`, elapsed time, progress bar (% width), `Day X / total`, `N left`.
- **Main 12-col grid** (`max-w-[1400px]`):
  - **TodayDirective** (`lg:col-span-8`): *"Today / Day XX brief"*, the directive in display type, a detail line, a session timer (`MM:SS`) with start/pause, a progress bar against goal, **Mark complete** (→ "Marked complete"), *"Logged N min · squad notified"*.
  - **SquadActivity** (`lg:col-span-4`): live feed of up to 8 squad events that animate in, *"Squad / {name} / Field activity"*, *"Open squad →"*; empty *"Quiet so far"*.
  - **WeeklyCadence** (`lg:col-span-5`): *"Cadence / Last 14 days"*, 7-col Mon–Sun grid of aspect-square cells (complete = ember/check, missed = X, today = bone border, future = transparent), `N day streak` in big tabular-nums.
  - **CycleObjectives** (`lg:col-span-7`): checklist with `done / total` counter, `divide-y` rows (not cards).

Empty/null: no CycleStrip. Optimistic updates on completion. Uses `LiveDot`, `Avatar`, `MonoLabel`, `Button`, Phosphor.

## Redesign goals
- This is the home base — it should feel like an instrument cluster, NOT a generic SaaS card grid. Keep the multi-region asymmetric layout; strengthen the visual hierarchy so "what do I do today" is unmistakable above everything else.
- Make the session timer + Mark complete the clear focal action.
- First-day empty state should be a calm field-log composition showing the first directive, not a "Welcome!" hero.

## The prompt (paste into Lovable)

> Redesign our **Dashboard** for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember sparingly,
> Geist Sans/Mono, mono kickers, no emoji, instrument-panel voice; **not a generic SaaS card grid** — use
> a multi-region asymmetric layout with `divide-y` and negative space over carded lists). Regions: a top
> **cycle status strip** (live dot, cycle code + name, `@handle`, elapsed time, a thin progress bar,
> `Day X / 30`, `N left`); a dominant **Today's directive** block (~60% width on desktop) with the directive
> in display type, one detail line, a `MM:SS` **session timer** with start/pause, a progress bar against the
> daily goal, and a single primary **Mark complete** action plus *"Logged N min · squad notified"* — this is
> the unmistakable focal point of the page; a **squad activity feed** right rail (~40%) showing the last ~8
> squad events that animate in, with mono timestamps and a live pulse-dot, linking to the squad; below the
> fold a **weekly cadence** grid (7-col Mon–Sun, aspect-square cells: complete / missed / today / future, with
> a `N day streak` in big tabular-nums) and a **cycle objectives** checklist using `divide-y` rows, not cards.
> First-day **empty state**: a calm composition that previews the upcoming first directive — never a generic
> "Welcome!" hero. Use live regions on the feed, skeletons (no spinners), mobile-first with a bottom nav at
> ≤768px, full keyboard nav, WCAG AA.
