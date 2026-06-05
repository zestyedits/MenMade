# 404 — Not Found — `app/not-found.tsx`

## What this page is for
The custom 404 shown for unknown routes.

## How it looks today
- `Navbar` + `Footer`, ink-950 with an ember radial glow (top-center), section `min-h calc(100dvh - 4rem)`.
- A 12-col asymmetric grid (`7` left / `4` right, offset): left = kicker *"Error / 404"*, a huge `clamp(3–8rem)` H1 *"Page not found."* ("Page not found" in ember), H2 *"The page you're looking for isn't where you left it."*, and a paragraph (*"Either the link is stale, the page hasn't been built yet, or you typed something the universe doesn't recognize. Receipts beat opinions; navigate back to known ground."*).
- Right column: 3 stacked buttons — **Back home** (bone) / **How it works** (outline) / **Report a broken link** (outline).
- Bottom strip: a `border-t` row of mono status info (`Status code 404` · `Not found` · `Nothing on file at this address`).

Uses `Navbar`, `Footer`, `MonoLabel`, Phosphor (`ArrowRight`, `MagnifyingGlass`).

## Redesign goals
- Keep the asymmetric layout (no centered 404) and the dry in-voice copy — it's a brand moment. Just make the type hierarchy and the recovery actions cleaner.

## The prompt (paste into Lovable)

> Redesign our **404 / Not Found** page for MenMade (brand rules in `00-BRAND-SYSTEM.md` — dark, ember
> sparingly, Geist Sans/Mono, mono kickers, no emoji, dry instrument-panel voice). Keep the shared Navbar and
> Footer and an **asymmetric layout (not centered)**: an ember radial glow, a left column with a kicker
> *"Error / 404"*, a huge display H1 *"Page not found."* (with "not found" in ember), a one-line H2 *"The page
> you're looking for isn't where you left it."*, and a short dry paragraph; a right column with stacked
> recovery actions — **Back home** (primary), **How it works**, **Report a broken link**; and a bottom mono
> status strip (`Status code 404 · Not found · Nothing on file at this address`). Make the type hierarchy and
> the recovery actions crisp. Mobile-first, full keyboard nav, WCAG AA.
