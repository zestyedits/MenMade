# Build: MenMade — auth, dashboard, and core app surfaces

## Product
MenMade is a private men's-development app organized around **squads** — small accountability groups running fixed-length **cycles** of real-world challenges (workouts, builds, finished projects — not vibes). Web and mobile-web ship in parallel today; a native iOS/Android app follows. Every surface must feel identical across desktop and phone, and every component should be patterned so it ports cleanly to React Native later.

The marketing landing page is already built and locked. You're building the **logged-in product** behind it. Match the landing page's brand exactly — do not reinvent the visual system.

---

## Visual system (LOCKED — do not redesign)

### Palette
```
INK (background ramp — stone-flavored neutrals):
  ink-50:  #f5f5f4
  ink-100: #e7e5e4
  ink-200: #d6d3d1
  ink-300: #a8a29e
  ink-400: #78716c
  ink-500: #57534e
  ink-600: #44403c
  ink-700: #292524
  ink-800: #1c1917
  ink-900: #14110f
  ink-950: #0c0a09   ← primary background

EMBER (single accent — use SPARINGLY, ~5–10% of the page):
  ember-50:  #fef4ec
  ember-100: #fde2c8
  ember-200: #f9bd8a
  ember-300: #f49555
  ember-400: #ef7b35   ← primary accent (the orange you see on "MADE")
  ember-500: #dd5722
  ember-600: #b8431a
  ember-700: #8e3214
  ember-800: #642210
  ember-900: #3d150a

NEUTRAL (foreground type):
  bone:  #ece7dc   ← primary text & logo block
  paper: #f7f4ee
```

The site is **dark-only**. No light mode. No purple/blue gradients. No second accent — ember is the only color that isn't a neutral.

### Typography
- **Sans:** Geist Sans. Use weights 400 / 500 / 700 / 800 / 900.
- **Mono:** Geist Mono. Reserved for instrument labels, indices, timestamps, status lines.
- **Display headlines:** `text-4xl md:text-6xl tracking-tighter leading-none font-extrabold`.
- **Body:** `text-[14–15px] leading-relaxed text-ink-200/75 max-w-[65ch]`.
- **Mono labels:** `font-mono text-[10–11px] uppercase tracking-[0.18em–0.22em] text-ink-300/60`.

### Logo lockup (do not modify)
- **Mark:** solid bone (`#ece7dc`) square, sharp corners, 32×32 at standard size, containing a black `M` set in Geist Sans weight 900.
- **Wordmark:** `MenMade` next to the mark, weight 800 uppercase tight tracking. **`Men` is bone (#ece7dc), `Made` is ember-400 (#ef7b35).** Implement as a single span with a nested span around `Made`.
- The mark and wordmark always appear together. Never use the mark alone, never the wordmark alone.

### Surface treatments
- **Borders:** `border-white/[0.04]` to `border-white/[0.10]` — barely-there hairlines, never heavier.
- **Cards:** `bg-ink-900` or `bg-ink-800` with a 1px inset highlight `inset 0 1px 0 rgb(255 255 255 / 0.06)`. Use **only** when elevation communicates hierarchy. Default to `border-t` / `divide-y` / negative space instead of card overuse.
- **Radii:** sharp for chrome (nav, buttons, badges = `rounded-none` or `rounded-sm`); generous for content cards (`rounded-[1.75rem]` to `rounded-[2.5rem]`).
- **Shadows (sparingly):** `shadow-[0_30px_60px_-25px_rgb(0_0_0/0.45)]`. Tint shadows toward the background hue.
- **Hairline divider:** linear-gradient(90deg, transparent, rgb(255 255 255 / 0.10), transparent), 1px tall.
- **Live dots:** 8px ember-400 dot with a `pulse-ring` animation (scale 0.85→2.2, opacity 0.6→0, 2.4s ease-out, infinite).
- **Film grain** (optional global polish): fixed full-screen SVG fractalNoise overlay at `opacity: 0.06`, `mix-blend-mode: overlay`, pointer-events-none.

### Buttons
- **Primary:** sharp-cornered bone block, ink-950 text, `font-sans text-[13px] font-bold uppercase tracking-[0.08em]`, `:hover` to white, `:active` `translate-y-[1px] scale-[0.985]`. Verb-first labels ("Enlist", "Start cycle", "Join squad").
- **Secondary:** transparent, `border border-white/15`, bone text, hover `bg-white/[0.04]`.
- **Tertiary/text:** mono uppercase tracked, with a 1px bone underline that scales in from the left on hover.

### Inputs
- `bg-ink-900`, `border border-white/10`, `rounded-none` or `rounded-sm`, `text-bone`, `placeholder:text-ink-400`.
- Label **above** input, weight 500, mono optional. Helper text below in `text-ink-300/70`. Errors below in `text-ember-400`.
- Focus: `border-ember-400/60 outline-none ring-1 ring-ember-400/30`.

### Motion
- Framer Motion. Hardware-accelerate via `transform` and `opacity` only — never `top/left/width/height`.
- Spring physics on interactives: `type: "spring", stiffness: 100, damping: 20`.
- Stagger reveals on lists/grids (`staggerChildren: 0.06`).
- All motion respects `prefers-reduced-motion: reduce` (auto-disable).
- Magnetic buttons on the primary CTA only — pull toward cursor using `useMotionValue`/`useTransform`, never React state.

---

## Voice (locked)

**Masculine, restrained, confident — with dry humor and satire as a deliberate layer.** Reference brands: Liquid Death, early Dollar Shave Club, Huckberry, Bonobos' early voice, Death Wish Coffee. Deadpan over jokey. Self-aware over earnest. Punches up at clichés (self-help grift, hustle culture, AI-coach hype), never down at users.

**Use precision-instrument language as the joke:** "Squad protocol", "Cycle 001", "Field log", "Enlist", "Method", "Operative", "Brief". The formality is the wink.

**Banned vocabulary** — reject any of these in copy:
- Hype: "revolutionary", "unleash", "10x", "game-changing", "transform your life"
- Therapy-coded: "journey", "self-care", "healing", "your truth", "lean in", "show up"
- AI cliché openings: "In a world where...", "Imagine if...", "Picture this:"
- Frat-bro/grift: "alpha", "sigma", "king", "bro" (unless used satirically)
- Emoji as punchline (no emoji anywhere — already banned project-wide)

**Existing taglines from landing — reuse the register:**
- *"A private squad app for men who'd rather finish a real thing than scroll a fake one."*
- *"Stop scrolling. Start cycling."*
- *"Built quietly, used loudly."*
- Status line pattern: `Live · 1,847 squads in cycle`

---

## Screens to build

Build these in order. Each screen needs **mobile-first responsive layout (320px–1440px+)**, complete state coverage (loading skeletons, empty states, error states, offline state), full keyboard navigation, and WCAG 2.2 AA contrast.

### 1. Sign in / Sign up (`/auth/sign-in`, `/auth/sign-up`)
- Split or asymmetric layout (no centered hero — banned). Left: form. Right: a brand panel with a quietly animated mono-label like `OPERATIVE / AUTHENTICATING` and the live squads-in-cycle counter.
- Email + password, plus "continue with Apple" / "continue with Google" as secondary buttons.
- Tab between sign-in and sign-up. URL-routed, not just JS state.
- Forgot-password and email-verification flows as separate screens.
- All form errors inline. Show enumeration-resistant messages ("If that email exists, we've sent a reset link.").

### 2. Onboarding (`/onboarding`)
- 4-step wizard, progress shown as a mono index `01 / 04`, not a candy-bar.
- Step 1: handle + display name. Step 2: pick or create a squad. Step 3: pick a cycle (cards showing length, intensity, focus area). Step 4: brief commitment screen ("You're enlisting in a 30-day cycle. No refunds on your time.") with a primary `Enlist` button.
- Skip/back must be keyboard-reachable. Closing the tab mid-flow preserves progress.

### 3. Dashboard (`/`)
The landed home for a logged-in user. Multi-region layout, NOT a generic SaaS card grid:
- **Top strip:** current cycle name + day index (`Cycle 003 · Day 12 of 30`), days remaining as a mono digit clock.
- **Hero block (left, ~60%):** today's directive in display type. One sentence. One primary CTA ("Mark complete"). A second-line mono note with the time committed today.
- **Right rail (~40%):** squad activity feed — the last 8 events from squad-mates ("Marcus marked Day 12 · 42min"). Mono timestamps. Pulse-dot for live.
- **Below the fold:** weekly cadence grid (7×N), streak indicators, current cycle objectives as a checklist with `divide-y` not cards.
- Empty state (first day): show a calm field-log composition with the upcoming first directive, not a generic "Welcome!" hero.

### 4. Squad (`/squads/[slug]`)
- Header: squad name, member avatars (bone-circle initials, no stock photos), live status, member count, "started 12 days ago".
- Tabs (mono uppercase, underline-on-active): **Brief / Roster / Field log / Settings**.
- **Field log** is the chat: full-bleed thread with day-stamped messages, optional image attachments, ember `@mention` highlights, deadpan empty state ("Nothing reported. That's a sign or a problem.").
- Roster: list with `divide-y`, member name, current streak, last seen.
- Member roles: lead vs operative. Lead can edit brief and remove members.

### 5. Cycle library (`/cycles`)
- Browseable index of cycle templates. Asymmetric grid, NOT a card matrix.
- Filter by length (7/14/30/90), focus (build / move / make), intensity. Filter chips are sharp-cornered ink-900 with bone outline when active.
- Each cycle card: cycle code (`P-014`), name, length, focus tag, intensity meter (5 dots, ember-filled), one-line summary in the brand voice.

### 6. Field log / Activity (`/field-log`)
- The user's personal log across all cycles. Reverse-chronological list with `divide-y`, mono timestamps.
- Filters: cycle, type, date range.
- Entry detail opens in a side sheet (desktop) or full screen (mobile) — same component, responsive.

### 7. Profile (`/u/[handle]`)
- Public-facing profile. Bone-square avatar (initials only, no stock images), handle, joined date, total cycles completed, current streak.
- Recent field-log highlights (only public entries).
- "Send brief" CTA (DM, only for squad-mates).

### 8. Settings (`/settings`)
- Sectioned page (no settings-as-cards): Account, Notifications, Privacy, Subscription, Sign out.
- Each section uses `border-t` separators, label-above-input forms, and an inline save indicator.
- Destructive actions (delete account, leave squad) require typed confirmation of the squad name or "DELETE".

---

## Cross-cutting requirements

### Component reuse
Build these primitives once and use them everywhere:
- `Button` (primary / secondary / tertiary)
- `Input`, `Textarea`, `Select`, `Checkbox`, `Toggle`
- `Avatar` (initials-only, bone circle, three sizes)
- `Badge` (mono uppercase tracked, ink-900 with bone or ember border)
- `Tabs` (underline-on-active, keyboard-navigable)
- `EmptyState` (composed, in voice, never a generic illustration)
- `Skeleton` (matches the layout it's standing in for; never a generic spinner)
- `Toast` (sharp corners, ink-900, mono label)
- `LiveDot` (ember-400 with pulse-ring)
- `MonoLabel` (`font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300/60`)

### Mobile / web parity
- Mobile-first. Verify at 320, 375, 414, 768, 1024, 1280, 1440.
- Bottom nav on mobile (≤768px) replaces the top nav: 5 tabs (Dashboard / Cycles / Squad / Field log / Profile). Phosphor icons + labels, ember underline on active.
- Use `min-h-[100dvh]` not `h-screen`. Test iOS Safari specifically.
- All gestures (swipe-to-dismiss sheets, pull-to-refresh) must have keyboard equivalents.

### Accessibility
- WCAG 2.2 AA contrast on every text/background pair (ember-400 on ink-950 is borderline at small sizes — verify).
- Color is never the only signal: pair ember accents with text, icons, or position.
- Every interactive element keyboard-reachable, focus visible (don't strip outlines — restyle them).
- Live regions on the activity feed and toast notifications.
- All motion respects `prefers-reduced-motion`.
- Form labels associated, errors announced, no input-without-label patterns.

### SEO (where indexable)
Most of the app is auth-walled, but the landing, /cycles index, and public profiles ARE indexable:
- Per-page `metadata` (title, description, canonical, OG/Twitter cards using the brand lockup).
- JSON-LD: Organization on root, Person on /u/[handle], CreativeWork on cycle templates.
- Semantic HTML: one `<h1>` per page, proper heading order, `<main>`/`<nav>`/`<section>` landmarks.
- Stable URL structure: `/squads/[slug]`, `/cycles/[code]`, `/u/[handle]` — no query-string IDs.

### Native portability
- Avoid web-only patterns that don't translate to React Native: no CSS `position: sticky` for critical UI, no scroll-snap as the only navigation mechanism, no `:has()` selectors as load-bearing logic.
- Keep state in React (Zustand or Jotai), not in URL fragments.
- Treat every page as a screen — no multi-modal layouts that assume a desktop window.

---

## Anti-patterns — do NOT ship any of these

- Centered hero/H1 layouts (banned by our design system — force split, asymmetric, or bottom-anchored).
- Purple/blue glow gradients ("AI Lila ban").
- Generic shadcn-default visuals without brand customization.
- Card-overuse — card every list item, card every metric. Use `divide-y` and negative space instead.
- Stock illustrations, generic empty-state cartoons, mascots, gradient mesh backgrounds.
- Pictorial logos (anvils, hammers, mountains, shields) — type-only, always.
- Decorative ember "blade" stripes on the side of buttons or panels.
- Indexed nav like "01 / CASE" in the top chrome (we tried, killed it).
- Therapy-coded copy. Hype copy. AI-cliché openings.
- Emoji anywhere in the UI.
- `h-screen` (use `min-h-[100dvh]`).
- Animating `top`/`left`/`width`/`height` (use `transform`/`opacity`).
- Loading spinners (use skeletons that match layout).

---

## Deliverable

Working, deployable app skeleton with all 8 screens above, full responsive parity from 320px to 1440px+, complete state coverage, and a shared component library that mirrors the landing page's visual register so the surfaces feel like one product. Stop and ask before introducing any third-party UI dependency not implied by this spec.
