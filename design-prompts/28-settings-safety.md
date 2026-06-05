# Settings · Safety — `/settings/safety`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Moderation controls: how flagged messages display, the block list, reports filed, and the platform hard-floor policy.

## How it looks today
- **01 / Bouncer — "Squad chat moderation":** copy on hard vs soft rules (+ link to `/terms`) and a RadioGroup *"Show flagged messages"* — Show inline / Collapse (recommended for new members) / Hide entirely.
- **02 / Block list — "Blocked members":** empty state *"No one blocked. Roast within reason and you won't need to start."*; otherwise a `divide-y` list with Avatar + @handle + *"Blocked"* + an **Unblock** button.
- **03 / Reports filed — "Messages you've reported":** empty state *"No reports filed. Use the message menu (… → Report)…"*; otherwise a `divide-y` list with a Flag icon + truncated message id + *"Squad {callsign} · under review"* + a *"Logged"* badge.
- **04 / Hard floors — "What's never allowed":** a `divide-y` list of 6 non-negotiable rules, each with an ember Prohibit icon.

Auto-saves visibility (*"Visibility changes save automatically." / "Saved."*). Uses `Section`, `RadioGroup`, `Avatar`, Phosphor (`Prohibit`, `Flag`, `ArrowCounterClockwise`).

## Redesign goals
- This is a sensitive surface — it should feel sober and clear (the "bouncer" framing is the dry wink, but blocking/reporting and hard floors must read seriously).
- Empty states should reassure in-voice; the hard-floor list should be visually firm and non-negotiable.

## The prompt (paste into Lovable)

> Redesign the **Safety** settings sub-page for MenMade inside the shared settings shell (brand rules in
> `00-BRAND-SYSTEM.md`; sectioned with `border-t`, lists use `divide-y`). Keep the dry "bouncer" framing for
> tone, but the blocking, reporting, and hard-floor content must read **sober and serious**. Sections:
> **01 Bouncer ("Squad chat moderation")** — a short explainer of hard vs soft rules (link to the full code)
> and a radio group *"Show flagged messages"* with Show inline / Collapse (recommended for new members) / Hide
> entirely; **02 Block list ("Blocked members")** — a `divide-y` list (Avatar + @handle + *"Blocked"* + an
> **Unblock** button) with a reassuring in-voice empty state (*"No one blocked. Roast within reason and you
> won't need to start."*); **03 Reports filed ("Messages you've reported")** — a `divide-y` list (Flag icon +
> truncated message id + *"Squad {callsign} · under review"* + *"Logged"* badge) with a dry empty state;
> **04 Hard floors ("What's never allowed")** — a visually firm `divide-y` list of six non-negotiable rules,
> each with an ember Prohibit icon. Visibility settings **auto-save**. Mobile-first, full keyboard nav, WCAG AA.
