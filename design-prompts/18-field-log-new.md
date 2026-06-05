# File a Field-Log Entry — `/field-log/new`

## What this page is for
The form for logging a field-log entry against the current cycle (day, minutes, note). Auth-gated, inside the dashboard chrome.

## How it looks today
- Inside `AuthGuard` + `DashboardChrome`. Container `max-w-[1280px]`.
- Header: a back button, kicker *"Field log / new entry"*, title *"File a brief."*, description *"One sentence is enough. The squad sees it. Time logged contributes to your cycle total."*
- Form: `grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]`:
  - **Left:** three numbered `Section`s — `01 Cycle & day` (Cycle + zero-padded Day inputs), `02 Minutes on the workbench` (Minutes input + preset buttons 15/30/45/60/90/120 with a Timer icon), `03 What did you do?` (textarea, placeholder *"One paragraph. What got done, what was hard, what's next."*, char counter `/1200`). Submit: **File brief**.
  - **Right:** a sticky sidebar (`lg:top-24`) — *"Filing to"* context with Day, Minutes, Note length.
- **Success:** swaps to a `CheckCircle` confirmation — *"Logged. Squad sees it."* with **Back to dashboard** + **Log another**.

Validation: day 1–365, minutes 0–1440, note non-empty (inline errors). Uses `Button`, `Input`, `MonoLabel`, `Section`.

## Redesign goals
- Make logging feel fast and frictionless — this is a recurring micro-action, not a long form. The preset minute buttons and a single confident submit should dominate.
- The sticky "Filing to" sidebar should reinforce *who sees this* so it feels like filing a report to the squad.
- Success should read like a logged receipt, not a generic confirmation.

## The prompt (paste into Lovable)

> Redesign our **"File a field-log entry"** form for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark,
> ember sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). It lives inside the
> authenticated dashboard chrome and is a **fast, recurring micro-action**, so keep it tight. Header: a back
> control, kicker *"Field log / new entry"*, title *"File a brief."*, one-line description (*"One sentence is
> enough. The squad sees it. Time logged contributes to your cycle total."*). Two-column layout on desktop
> (`1fr / 320px`): left is three numbered sections — `01 Cycle & day` (cycle select + zero-padded day),
> `02 Minutes on the workbench` (a minutes input plus quick-preset buttons 15/30/45/60/90/120 that dominate
> the interaction), `03 What did you do?` (a textarea, placeholder *"One paragraph. What got done, what was
> hard, what's next."*, with a `/1200` char counter) — then a single confident **File brief** button. The
> right column is a sticky **"Filing to"** panel that reinforces *who will see this* (squad, day, minutes,
> note length). On submit, swap to an in-voice **logged receipt** — *"Logged. Squad sees it."* — with Back to
> dashboard / Log another. Inline ember mono-caps validation (day 1–365, minutes 0–1440, note required).
> Mobile-first, full keyboard nav, visible focus, WCAG AA.
