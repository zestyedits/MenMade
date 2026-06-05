# Settings · Privacy & Data — `/settings/privacy`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
The privacy posture page: explains local-first storage, lists what's kept / never collected / which vendors, email-preference toggles, data export, and a local-wipe danger zone.

## How it looks today
- **01 / Posture — "Local-first by default":** copy + an ember-accented Lock infobox about only syncing when you join a shared squad.
- **02 / "What we keep locally":** a `divide-y` list of 8 items, each with an ember CheckCircle.
- **03 / "What we don't take":** a `divide-y` list of 5 items, each with a muted X.
- **04 / Vendors — "Who we share infrastructure with":** a list pairing vendor name (mono) with purpose (Vercel — hosting; Resend (planned) — transactional email).
- **05 / "What we're allowed to send":** Marketing email toggle (off by default); Product update email toggle (recommended on).
- **06 / "Activity outside your squads":** a cross-squad-feed sharing toggle (off by default).
- **07 / Export — "Take your data with you":** *"Export everything"* button → downloads `menmade-export-{date}.json`, transient *"Downloaded."* badge.
- **Danger — "Wipe local data":** type-`WIPE`-to-confirm → ember alert + input + Wipe everything (disabled until match) + Cancel.

Auto-saves email/sharing toggles. Uses `Section`, `Toggle`, Phosphor (`Lock`, `Download`, `Trash`, `Warning`, `CheckCircle`, `X`).

## Redesign goals
- This page is a brand trust statement as much as a settings page — the kept/never/vendors lists should read as a confident, transparent ledger, not legal boilerplate.
- Keep the local-wipe danger zone clearly separated from the routine toggles and export.

## The prompt (paste into Lovable)

> Redesign the **Privacy & Data** settings sub-page for MenMade inside the shared settings shell (brand rules
> in `00-BRAND-SYSTEM.md`; sectioned with `border-t`, lists use `divide-y`, not cards). This page is a
> **transparency ledger** as much as a settings screen — make it read confident and honest. Sections:
> **01 Posture ("Local-first by default")** with an ember-accented Lock infobox about only syncing when you
> join a shared squad; **02 "What we keep locally"** — a `divide-y` list (ember check per item); **03 "What we
> don't take"** — a `divide-y` list (muted X per item); **04 Vendors** — name↔purpose rows (Vercel / hosting,
> Resend (planned) / transactional email); **05 "What we're allowed to send"** — Marketing email (off by
> default) and Product-update email (recommended on) toggles; **06 "Activity outside your squads"** — a
> cross-squad-feed sharing toggle (off by default); **07 Export ("Take your data with you")** — an *"Export
> everything"* button that downloads a dated JSON file with a transient *"Downloaded."* acknowledgement; and a
> clearly walled-off **Danger ("Wipe local data")** zone with a **type `WIPE` to confirm** gate. Email/sharing
> toggles auto-save. Mobile-first, full keyboard nav, WCAG AA.
