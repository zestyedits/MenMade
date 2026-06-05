# MenMade — Brand System (paste this into Lovable as Knowledge / project context FIRST)

> Set this as a Knowledge doc / pinned context in Lovable before generating any page.
> Every per-page prompt in this folder assumes these rules are already loaded.
> These rules are **locked**. Lovable should make the layouts better, not reinvent the visual language.

---

## What MenMade is

A private men's-development app built around **squads** — small accountability groups
running fixed-length **cycles** of real-world challenges (workouts, builds, finished
projects — not vibes). Dark, restrained, instrument-panel aesthetic. The marketing
landing page is already polished and **locked** — match it, don't redesign it.

The voice is the product's personality: masculine, restrained, confident, with **dry
satire** as a deliberate layer. It uses precision-instrument language as the joke —
"Squad protocol", "Cycle 001", "Field log", "Enlist", "Operative", "Brief". The formality
is the wink. Reference brands: Liquid Death, early Dollar Shave Club, Huckberry, Death Wish Coffee.

---

## Palette (dark-only — NO light mode)

```
INK (backgrounds — stone-flavored neutrals)
  ink-950 #0c0a09  ← primary background
  ink-900 #14110f / #1c1917
  ink-800 #1c1917
  ink-700 #292524
  ink-300 #a8a29e (dim text)
  ink-200 #d6d3d1

EMBER (the ONLY accent — use SPARINGLY, ~5–10% of any screen)
  ember-400 #ef7b35  ← primary accent (the orange on "MADE")
  ember-500 #dd5722
  ember-300 #f49555

NEUTRAL FOREGROUND
  bone  #ece7dc  ← primary text & logo block
  paper #f7f4ee
```

No purple/blue gradients. No second accent. Ember is the only non-neutral color.

## Typography

- **Sans:** Geist Sans (weights 400/500/700/800/900).
- **Mono:** Geist Mono — reserved for instrument labels, indices, timestamps, status lines, codes.
- **Display headlines:** `text-4xl md:text-6xl tracking-tighter leading-none font-extrabold`, uppercase.
- **Body:** `text-[14–15px] leading-relaxed text-ink-200/75 max-w-[65ch]`.
- **Mono labels (kickers):** `font-mono text-[10–11px] uppercase tracking-[0.18em–0.22em] text-ink-300/60`,
  often with a leading hairline rule. Pattern: `Field log / 001`, `Cycle / oversight`.

## Logo lockup (do not modify)

Solid bone square (sharp corners) holding a black `M` in Geist weight 900, next to the
wordmark `MenMade` — **`Men` is bone, `Made` is ember-400**. Mark + wordmark always
together. Type-only. Never a pictorial mark (no anvils/hammers/mountains/shields).

## Surfaces

- **Borders:** barely-there hairlines `border-white/[0.04]` → `border-white/[0.10]`.
- **Cards:** `bg-ink-900`/`bg-ink-800` with a 1px inset top highlight. Use ONLY when elevation
  communicates hierarchy. Default to `divide-y` / `border-t` / negative space over card-overuse.
- **Radii:** sharp for chrome (nav/buttons/badges = `rounded-none`/`rounded-sm`); generous for
  content cards (`rounded-[1.75rem]`–`rounded-[2.5rem]`).
- **Hairline divider:** `linear-gradient(90deg, transparent, white/10, transparent)`, 1px tall.
- **Live dots:** 8px ember-400 dot with a `pulse-ring` animation. Status line pattern: `Live · 1,847 squads in cycle`.
- **Film grain:** subtle full-screen SVG noise overlay at ~6% opacity, `mix-blend-mode: overlay`.

## Buttons

- **Primary:** sharp bone block, ink-950 text, `text-[13px] font-bold uppercase tracking-[0.08em]`,
  hover→white, active `translate-y-[1px] scale-[0.985]`. Verb-first labels ("Enlist", "Start cycle", "Mark complete").
- **Secondary:** transparent, `border border-white/15`, bone text, hover `bg-white/[0.04]`.
- **Tertiary:** mono uppercase tracked, 1px bone underline scaling in from the left on hover.

## Inputs

- `bg-ink-900`, `border border-white/10`, `rounded-none`/`rounded-sm`, `text-bone`, `placeholder:text-ink-400`.
- Label **above** input. Helper below in `text-ink-300/70`. Errors below in `text-ember-400` (mono caps).
- Focus: `border-ember-400/60 ring-1 ring-ember-400/30`.

## Motion

- Framer Motion; animate `transform`/`opacity` only — never `top/left/width/height`.
- Spring on interactives (`stiffness: 100, damping: 20`). Stagger list reveals (`staggerChildren: 0.06`).
- Respect `prefers-reduced-motion: reduce` everywhere. Magnetic pull on the primary CTA only.

## Global chrome (already built — keep consistent)

- **Navbar:** sticky 64px bar, backdrop-blur that intensifies on scroll, logo left, mono-uppercase
  nav links center ("How it works", "Pricing", "Field log") with left-origin underline-on-hover,
  auth buttons right. Mobile: hamburger → full-width slide-down panel.
- **Footer:** logo + tagline + live status dot left, three mono-headed link columns (Product / Company / Legal),
  `© 2026 MenMade Co. — built in the open`.
- **Mobile (≤768px):** bottom nav replaces top nav — 5 tabs (Dashboard / Cycles / Squad / Field log / Profile),
  Phosphor icons + labels, ember underline on active.

---

## Hard bans (reject any of these)

- Centered hero/H1 layouts — force split, asymmetric, or bottom-anchored.
- Purple/blue glow gradients ("AI Lila" look). Gradient-mesh backgrounds.
- Generic shadcn-default visuals with no brand customization.
- Card-overuse (carding every list row / every metric) — use `divide-y` + negative space.
- Stock illustrations, empty-state cartoons, mascots.
- Pictorial logos. Decorative ember "blade" stripes on buttons/panels.
- Emoji anywhere in the UI.
- `h-screen` (use `min-h-[100dvh]`). Animating `top/left/width/height`. Loading spinners (use skeletons).
- Therapy-coded copy ("journey", "self-care", "show up", "your truth"), hype copy ("revolutionary",
  "unleash", "10x", "game-changing"), AI-cliché openings ("In a world where…", "Imagine if…"),
  frat-bro/grift ("alpha", "sigma", "king", "bro" — unless clearly satirical).

## Every screen must ship

Mobile-first responsive (verify 320 / 375 / 414 / 768 / 1024 / 1280 / 1440), full state coverage
(loading skeletons, empty states, error states), full keyboard nav with visible focus, WCAG 2.2 AA
contrast (ember-400 on ink-950 is borderline at small sizes — verify), and copy in the voice above.
Color is never the only signal — pair ember with text/icon/position.
