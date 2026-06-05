# Settings · Notifications — `/settings/notifications`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
Configure cycle reminders, squad activity pings, email digests, and per-channel master switches. Auto-saves on every toggle.

## How it looks today
Four `Section`s, each a `SettingsGroup` of toggles divided by thin `border-t` hairlines:
- **01 / Cycle — "Cycle reminders":** Daily directive reminder; Cycle close reminder (*"48 hours before your cycle ends…"*).
- **02 / Squad — "Squad activity":** All squad activity; Mentions only (*"Overrides 'all squad activity'."* — interdependent: turning one on adjusts the other); Squad lead announcements.
- **03 / Digest — "Email digests":** Daily digest; Weekly digest.
- **04 / Channels — "Where notifications go":** Push (prompts the OS first time); Email; In-app (checked + **disabled**, *"Always on."*).

Footer: *"Changes save as you toggle."* / transient *"Saved."*. Each toggle = label + description + ember switch.

## Redesign goals
- A long stack of toggles is the risk here — use the section grouping + descriptions to keep it scannable and prevent a wall of switches.
- Make the interdependency (Mentions-only overriding All-activity) and the locked "In-app · Always on" toggle visually legible, not confusing.

## The prompt (paste into Lovable)

> Redesign the **Notifications** settings sub-page for MenMade inside the shared settings shell (brand rules
> in `00-BRAND-SYSTEM.md`; sectioned with `border-t`, toggles grouped — avoid an undifferentiated wall of
> switches). Four grouped sections, each toggle showing a label + a one-line description + an ember switch:
> **01 Cycle reminders** (daily directive reminder; cycle-close reminder 48h before end); **02 Squad activity**
> (all squad activity; mentions-only, which **overrides** all-activity — make that interdependency visually
> clear; squad-lead announcements); **03 Email digests** (daily; weekly); **04 Channels — "Where notifications
> go"** (Push, which prompts the OS the first time; Email; and In-app shown **locked on / "Always on"** as a
> clearly non-interactive state, not a broken toggle). Everything **auto-saves on toggle**, acknowledged by a
> footer that reads *"Changes save as you toggle."* / *"Saved."* Mobile-first, full keyboard nav, switches with
> proper `role="switch"` semantics, WCAG AA.
