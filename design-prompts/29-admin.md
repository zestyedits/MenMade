# Admin — `/admin`

> Founder-only control deck (auth + admin allowlist gated). Not user-facing; redesign for operator clarity, not marketing polish.

## What this page is for
A single-page operational dashboard: live vitals, recent enlistees, active subscriptions, founder-seat heatmap, webhook activity, mod-queue placeholder, and an admin-actions audit log — plus an alert feed and per-user/refund actions.

## How it looks today
- **AdminShell:** `max-w-[1280px]`, header — kicker *"Command / oversight"*, H1 *"Admin"*, copy *"The control deck. Numbers are live. Actions hit production data. Don't click things you can't justify in a refund email."* Sections stack with a 2px ember left accent rail and big mono section numbers (`00–06`).
- **Buddy panel:** a concern-signals feed (*"Buddy / Field comms"*, `N open`) — severity-dot rows (red/amber/bone) with kind chip + time-ago + dismiss; empty *"All clear. Nothing's broken."*
- **00 Vitals:** a 6-tile big-number grid (Operatives, Paid %, Founder seats, Operator active, Founder active, MRR).
- **01 Recent enlistees:** table (email, handle, plan, joined, actions kebab).
- **02 Active subscriptions:** table (email, plan, status chip, renews/ends, seat #, refund button).
- **03 Founder seats:** a 25×20 = 500-cell recency heatmap (color by claim age) + legend.
- **04 Webhook activity:** table (event type, id, received; flagged rows amber).
- **05 Squad reports:** Phase-3 placeholder.
- **06 Admin actions log:** table (action chip, admin, target, timestamp).
- **UserActionsMenu:** kebab popover — suspend/unsuspend/reset-password/grant·revoke founder seat/promote/delete, with inline reason prompts + two-step destructive confirms.
- **RefundButton:** two-step (Issue refund → Confirm refund, 5s window → Working… → *"Refunded · $X.XX"*).

Color-keyed chips (plan/status/event/action), striped hover tables, film grain. Uses custom `AdminSection`/`BigTile`/`StatusChip`/`Table` primitives.

## Redesign goals
- This is a dense operator tool — optimize for **at-a-glance legibility and safe destructive actions**, not visual flair. Keep the instrument-panel aesthetic but prioritize scan speed, clear status semantics, and unmistakable confirm steps on anything that hits production/money.
- Tables must stay usable on smaller widths; the founder heatmap should be readable with a clear legend; the alert feed should surface the worst thing first.

## The prompt (paste into Lovable)

> Redesign our internal **Admin control deck** for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji, instrument-panel voice). This is a **founder-only
> operations tool**, not a marketing surface — optimize for scan speed, status legibility, and safe
> destructive actions over flair. Single page, sections with a 2px ember accent rail and big mono section
> numbers (`00–06`): a top **alert feed** ("Buddy / Field comms") that surfaces the most severe signal first
> with severity dots (red/amber/bone), kind + time-ago, and dismiss, plus a calm *"All clear"* empty state;
> **00 Vitals** — a 6-tile big-number grid (Operatives, Paid %, Founder seats, Operator active, Founder
> active, MRR); **01 Recent enlistees** and **02 Active subscriptions** as dense, hover-striped tables that
> stay usable at narrow widths, with color-keyed plan/status chips and a per-row actions kebab + refund
> control; **03 Founder seats** — a 500-cell recency heatmap with a clear legend; **04 Webhook activity** —
> a table flagging failures in amber; **05** a mod-queue placeholder; **06 Admin actions log** — an audit
> table with action chips. The per-user **actions menu** (suspend / unsuspend / reset password / grant·revoke
> founder seat / promote / delete) and the **refund** control must use explicit **two-step confirmations with
> typed reasons** for anything that touches production data or money — make the "this is irreversible" moment
> unmistakable. Header copy: *"The control deck. Numbers are live. Actions hit production data. Don't click
> things you can't justify in a refund email."* Keep tables accessible (semantic, sortable-feeling), color
> never the only status signal, full keyboard nav, WCAG AA.
