# Squad (redirect) — `/squad`

## What this page is for
A transitional route only. It fetches the user's first active squad and redirects to `/squads/{slug}` (or `/squads/founders-circle` as fallback). No real UI.

## How it looks today
A bare centered loading state on a `60vh` container: mono label *"Routing to your squad…"*. Fires a `useEffect` → `/api/squads/me`, then redirects. No content of its own.

## Redesign goals
- This isn't a design surface — it's a redirect. The only thing worth polishing is the brief loading flash so it matches the rest of the app instead of looking like a dead frame.

## The prompt (paste into Lovable)

> This is a pure **redirect route** for MenMade — it routes a user to their active squad and renders nothing
> permanent. Don't design a full page. Just give the brief loading flash an on-brand treatment consistent
> with `00-BRAND-SYSTEM.md` (dark ink-950, a mono *"Routing to your squad…"* label, a subtle branded pulse —
> **no spinner**), respecting reduced-motion. Keep it minimal; the user should only see it for a moment.
