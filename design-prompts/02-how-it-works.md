# How It Works — `/how-it-works`

## What this page is for
Educational page that explains MenMade's mechanics across five "moves" and the design principles behind it.

## How it looks today
Long scroll, 6 sections that alternate dark/paper to break rhythm:
1. **Hero** — dark, dramatic. Headline: *"Five moves. No fluff."*
2. **ProductTour** — dark, auto-advancing carousel of product surfaces (hover-to-pause).
3. **PaperSpread** — light paper bg, a giant ember `Quotes` glyph (~360px) drifting on scroll. Thesis: *"The streak is the proof. The streak is the leverage."*
4. **StatStrip** — dark with radial gradient, animated `CountUp` numbers (`5.4 avg squad size`, `30d shortest cycle`, `87% median close rate`, `1847 squads live now`).
5. **Principles** — alternating paper/dark cards, 2-col grid: *"Witnesses, not coaches." / "Receipts, not reminders." / "Cycles end. Decisively." / "Built quietly, used loudly."*
6. **CTA** — dark, radial gradient. *"Ready to run it."* with `Start free` / `See pricing` / `Browse cycles`.

Uses: `ScrollProgress`, `Navbar`, `MonoLabel`, `Button`, `CountUp`, `ProductTour`, `Footer`, Phosphor icons. Fluid `clamp()` type, scroll-driven Framer Motion, mono kickers `001/003/004/005`.

## Redesign goals
- Keep the dark↔paper alternation but tighten the vertical rhythm so the five "moves" read as one numbered system, not five unrelated sections.
- Make the ProductTour feel like an instrument readout, not a generic SaaS carousel.
- Strengthen the scroll narrative so a first-time visitor understands squad → cycle → field log → close in one pass.

## The prompt (paste into Lovable)

> Redesign our **How It Works** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark ink-950
> base, ember accent at ~5–10%, Geist Sans/Mono, mono kicker labels, no emoji, no purple, satirical
> instrument-panel voice). It's a logged-out education page that explains the product as **five moves**.
> Keep these sections but make them flow as one numbered narrative: (1) Hero — asymmetric, headline
> *"Five moves. No fluff."*; (2) an auto-advancing product tour of the real app surfaces that reads like
> a readout, not a carousel; (3) a paper-background thesis spread with one big quote — *"The streak is the
> proof. The streak is the leverage."*; (4) an animated stat strip (`5.4 avg squad size`, `30d shortest
> cycle`, `87% median close rate`, `1,847 squads live now`); (5) four design principles as alternating
> paper/dark cards (*"Witnesses, not coaches."*, *"Receipts, not reminders."*, *"Cycles end. Decisively."*,
> *"Built quietly, used loudly."*); (6) a closing CTA *"Ready to run it."* with Start free / See pricing /
> Browse cycles. Use mono `001 / 002 …` kickers, scroll-driven motion on transform+opacity only, and respect
> reduced-motion. Mobile-first, full state coverage. Make the squad → cycle → field log → decisive close
> story land in a single scroll.
