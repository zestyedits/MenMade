# Pricing — `/pricing`

## What this page is for
Presents the Free / Operator / Founder's Pass tiers with a live founder-seat counter, comparison matrix, and FAQ.

## How it looks today
Long scroll, 6 sections:
1. **Hero** — *"Pay for the thing. Not the trap."*
2. **Pricing cards** — 3 tiers in a `3 / 5 / 4` column split on lg. **Free** ($0 / Forever · no card), **Operator** ($14/mo or $129/yr, "SAVE 23%" annual, visually elevated: `border-2 ember-400/60`, badge *"Most men land here"*), **Founder's Pass** ($299 one-time, live `X of 500 left` counter + progress bar, "Sold out" when gone). Monthly/annual toggle (tactile bone-on button). Operator card has expandable "Plus 5 more".
3. **Upgrade scenarios** — 3-col cards with user quotes (Wes/lead tools, Marcus/concurrent cycles, Theo/field-log retention).
4. **Comparison matrix** — scrollable table, 4 feature groups × 3 tiers, ember group labels.
5. **Pricing principles** — 2×2 callouts: *Free works · No fake urgency · Cancel actually cancels · Refunds are honest.*
6. **FAQ** — left label, right Q&A list.

Uses: `ScrollProgress`, `Navbar`, `MonoLabel`, `Button`, `Footer`, Phosphor (`CheckCircle`, `Lock`, `Crown`, `Lightning`). Founder counter fetched server-side.

## Redesign goals
- Make the three-tier comparison legible at a glance without forcing a scroll to the matrix.
- Give the Founder's Pass scarcity counter real weight (it's the highest-intent action) without resorting to fake-urgency patterns the brand explicitly bans.
- Tighten the matrix so it's scannable on mobile, not a horizontal-scroll afterthought.

## The prompt (paste into Lovable)

> Redesign our **Pricing** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember accent
> sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice; **no fake-urgency
> patterns** — honesty is a stated brand principle). Three tiers: **Free** ($0, forever, no card — "the
> standalone product"), **Operator** ($14/mo or $129/yr, annual saves 23%, the recommended tier — elevate
> it with an ember hairline border and a small mono badge *"Most men land here"*), and **Founder's Pass**
> ($299 one-time, capped at 500 — show a live `N of 500 left` counter with a restrained progress bar that
> conveys real scarcity without countdown-timer theatrics, and a clean "Sold out" state). Include a
> monthly/annual toggle, a scannable feature **comparison matrix** (4 groups × 3 tiers) that stays legible
> on mobile instead of horizontal-scrolling, three upgrade-scenario cards with short user quotes, a 2×2
> "pricing principles" block (*Free works / No fake urgency / Cancel actually cancels / Refunds are honest*),
> and an FAQ. Hero line: *"Pay for the thing. Not the trap."* Mobile-first, full state coverage, ember at
> ~5–10% of the page.
