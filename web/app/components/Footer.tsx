import Link from "next/link";
import { Logo } from "./ui/Logo";

const cols = [
  {
    title: "Product",
    links: [
      ["The case", "#impact"],
      ["How it works", "#tour"],
      ["Pricing", "/pricing"],
      ["Squads", "#proof"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#"],
      ["Manifesto", "#"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["Contact", "/contact"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950 pb-10 pt-20 text-bone">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-12 gap-y-12 gap-x-6">
          <div className="col-span-12 md:col-span-6">
            <Logo size="md" />

            <p className="mt-6 max-w-[44ch] text-[14px] leading-relaxed text-ink-200/75">
              A private squad app for men who&rsquo;d rather finish a real
              thing than scroll a fake one. Built quietly, used loudly.
            </p>

            <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/70">
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inset-0 rounded-full bg-ember-400" />
                <span className="relative h-2 w-2 rounded-full bg-ember-400" />
              </span>
              Live &middot; 1,847 squads in cycle
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title} className="col-span-6 md:col-span-2">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
                {col.title}
              </div>
              <ul className="mt-5 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[14px] text-ink-100/85 transition hover:text-bone"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-6 md:flex-row md:items-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/60">
            &copy; 2026 MenMade Co. &mdash; built in the open
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300/60">
            Stop scrolling. Start cycling.
          </div>
        </div>
      </div>
    </footer>
  );
}
