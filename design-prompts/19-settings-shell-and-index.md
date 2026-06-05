# Settings Shell + Index — `/settings`

> Read this before the other settings prompts (20–28). Every settings sub-page shares one shell.
> `/settings` itself just redirects to `/settings/account`.

## What this is for
The shared chrome that wraps all 9 settings sub-pages: a left section nav + a header + a sectioned content column.

## How it looks today (shared `SettingsShell`)
- **Layout:** two columns. Desktop (lg+): a fixed `240px` left sidebar, sticky at `top-20`, + a `1fr` content column. Mobile: a horizontal-scroll pill nav with a bottom border.
- **Header (above the grid):** a mono breadcrumb *"Settings / NN — {Label}"* (NN zero-padded 01–08), a big H1 (`34px md:44px`, extrabold, uppercase) showing the active tab label, and a description *"Tune the product to your run. Everything stays on this device unless you say so."*
- **Nav (8 entries, each icon + mono-uppercase label):** Account (User), Profile (IdentificationCard), Notifications (Bell), Privacy & data (Lock), Safety (ShieldCheck), Accessibility (Eye), Subscription (CreditCard), Legal & about (Scales). Active = bone text + ember filled icon + a 2px ember accent bar (vertical on desktop, horizontal underline on mobile).
- **Content:** a `flex flex-col gap-12` column of `Section`s. The `Section` primitive = optional mono kicker + title (`22px md:26px` uppercase) + optional description (`max-w-60ch`) + a `border-t` separator (ember-tinted when destructive); the first section drops its top border.

Shared primitives across all settings pages: `Section`, `Toggle` (label + description + ember switch), `RadioGroup` (legend + options, ember selected ring), `Input`, `Button`, `Avatar`, `MonoLabel`, `SettingsGroup`. Save feedback is a brief mono *"Saved."* (~1.5–1.8s) — most pages auto-save on change.

## Redesign goals
- Make the settings nav feel like a control index (mono numbering, instrument labels) rather than a generic settings sidebar. Keep the active-section signal strong on both desktop and mobile.
- Settings are sectioned, NOT carded — preserve the `border-t` / `divide-y` rhythm and resist turning each setting into a card.
- The auto-save *"Saved."* feedback should feel like a system acknowledgement, consistent across every sub-page.

## The prompt (paste into Lovable)

> Redesign the shared **Settings shell** for MenMade — it wraps every settings sub-page, so design it once
> (brand rules in `00-BRAND-SYSTEM.md` — dark, ember sparingly, Geist Sans/Mono, mono kickers, no emoji, dry
> instrument-panel voice). Two-column layout: a left **section index** (desktop: fixed ~240px, sticky;
> mobile: a horizontal-scroll pill row) listing eight entries with an icon + mono-uppercase label — Account,
> Profile, Notifications, Privacy & data, Safety, Accessibility, Subscription, Legal & about — where the
> active entry shows bone text, an ember filled icon, and a 2px ember accent bar (vertical on desktop,
> underline on mobile). Above the grid: a mono breadcrumb *"Settings / 01 — Account"*, a big uppercase H1 of
> the active section, and the line *"Tune the product to your run. Everything stays on this device unless you
> say so."* The content column is a stack of **sections separated by `border-t` hairlines — never carded** —
> each with a mono kicker, an uppercase title, and an optional description, using `divide-y` for any inner
> lists. Most settings **auto-save**, acknowledged by a brief mono *"Saved."* that reads like a system
> confirmation. Build shared primitives (Section, Toggle with label+description+ember switch, RadioGroup with
> an ember selected ring, Input, Button, Avatar) so all sub-pages are visually identical. `/settings` redirects
> to Account. Mobile-first, full keyboard nav, visible focus, WCAG AA.
