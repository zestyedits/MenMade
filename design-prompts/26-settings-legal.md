# Settings · Legal & About — `/settings/legal`

> Uses the shared settings shell — see `19-settings-shell-and-index.md`.

## What this page is for
In-app access to legal docs, plain-language summaries (code of conduct, UGC, DMCA, subscription/refund), open-source attributions, build/version info, and support routes.

## How it looks today
- **01 / Documents — "The signed paperwork":** a grid of link cards (Terms / Privacy / Contact), each icon + title + description + a corner ArrowUpRight.
- **02 / "The short version":** a `divide-y` list of 4 plain-language summaries — Code of conduct, User-generated content, DMCA / copyright, Subscription & refund.
- **03 / Open source — "What we build on":** a name↔license list (Next.js MIT, React MIT, Tailwind MIT, Framer Motion MIT, Phosphor MIT, Geist OFL) + an SBOM-on-request footer.
- **04 / Build — "Version":** an info box (App version `0.1.0-build-md`, Surface `Web`, Built by `MenMade Co.`).
- **05 / Reach us — "Press, legal, support":** a 3-col card grid (Contact form / DMCA takedown / Press kit).

Static. Uses `Section`, `Link`, Phosphor (`FileText`, `ShieldCheck`, `EnvelopeSimple`, `ArrowUpRight`, `Receipt`, `Package`).

## Redesign goals
- Make legal/about feel like an honest spec sheet (in-voice: "the things you actually agreed to", "who's holding the floor up"), not a dumping ground of links.
- Document-link cards should clearly signal "opens the full doc"; the open-source + version blocks should read like a tidy manifest.

## The prompt (paste into Lovable)

> Redesign the **Legal & About** settings sub-page for MenMade inside the shared settings shell (brand rules
> in `00-BRAND-SYSTEM.md`; sectioned with `border-t`, lists use `divide-y`). Treat it as an honest spec sheet
> in the MenMade voice, not a link dump. Sections: **01 Documents ("The signed paperwork")** — link cards for
> Terms, Privacy, and Contact, each with an icon, title, one-line description, and a corner arrow signalling it
> opens the full document; **02 "The short version"** — a `divide-y` list of four plain-language summaries
> (Code of conduct, User-generated content, DMCA / copyright, Subscription & refund), each a short heading +
> dry paragraph; **03 Open source ("What we build on")** — a tidy name↔license manifest (Next.js / React /
> Tailwind / Framer Motion / Phosphor as MIT, Geist as OFL) with an SBOM-on-request footer; **04 Build
> ("Version")** — a small info box (app version, surface, built by); **05 Reach us** — a three-card grid for
> Contact form / DMCA takedown / Press kit. Static, no toggles. Mobile-first, full keyboard nav, WCAG AA.
