# Cycle Library — `/cycles`

## What this page is for
A browseable, filterable index of cycle templates squads can run. Public / indexable.

## How it looks today
- **Navbar** + **Footer**.
- **Hero:** ember radial backdrop, kicker *"Cycle library / 001"*, title *"Pick a fight worth picking."*, subtitle about 12 curated templates with documented close rates, and a stats bar (`N templates`, `14 · 30 · 60 · 90 day cycles`, `Median squad close rate 79%`).
- **CycleFilters:** three stacked rows (Focus / Length / Intensity), each a label + sharp-cornered chips; active chip = ember border + bg + text. A results count (`N cycles matching`) and a "Clear filters" link when active.
- **Grid:** when unfiltered, a **featured** card spans `lg:col-span-2 lg:row-span-2` (ember border, larger heading, full brief paragraph) alongside others in a `1 / 2 / 3`-col responsive grid. Each `CycleCard`: code (`P-001`), focus tag, name, one-line summary, a 5-dot intensity meter (ember-filled), footer with author / runs / close rate / arrow. Cards animate in on scroll.
- **Empty:** *"Nothing matches. Loosen a filter…"*.
- **Bottom CTA:** *"Don't see your fight?"* — Operator-unlocks-custom-cycles, with *See Operator pricing* + *Start on Free*.

Uses `MonoLabel`, `CycleCard`, `CycleFilters`, Framer Motion.

## Redesign goals
- Keep the asymmetric grid (featured + matrix) — NOT a uniform card matrix. The featured cycle should feel genuinely featured.
- Make the filter chips feel like instrument switches; results should update smoothly without layout jump.
- Each card should read like a spec sheet (code, focus, intensity meter, close rate) — the close rate is the proof, give it weight.

## The prompt (paste into Lovable)

> Redesign our **Cycle Library** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). It's a public, indexable,
> filterable index of cycle templates. Hero: kicker *"Cycle library / 001"*, title *"Pick a fight worth
> picking."*, a one-line subtitle about curated templates with documented close rates, and a small stats bar
> (`N templates`, `14 · 30 · 60 · 90 day cycles`, `Median squad close rate 79%`). Below it, a **filter bar**
> with three rows of sharp-cornered chips — Focus (Build / Move / Make / Master / Mend / Mark), Length
> (14/30/60/90), Intensity (Light / Steady / Heavy / Brutal) — active chips in ember, plus a live results
> count and a Clear link. Use an **asymmetric grid, not a uniform matrix**: when no filters are applied, a
> single **featured** cycle spans two columns/rows (ember border, larger heading, a full brief paragraph)
> beside a responsive `1/2/3`-col grid of cards. Each **cycle card** is a spec sheet — code (`P-001`), focus
> tag, name, one-line dry summary, a 5-dot **intensity meter** (ember-filled), and a footer with author, run
> count, and **close rate** (the proof — give it weight) plus a corner arrow. Cards reveal on scroll
> (transform/opacity, reduced-motion safe). Empty state: *"Nothing matches. Loosen a filter and try again."*
> Bottom CTA: *"Don't see your fight?"* pointing custom cycles to Operator, with See Operator pricing /
> Start on Free. Mobile-first, full keyboard nav, WCAG AA, per-page metadata + CreativeWork JSON-LD on cards.
