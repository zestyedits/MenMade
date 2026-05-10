import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MonoLabel } from "./ui/MonoLabel";

type Props = {
  kicker: string;
  title: string;
  effective: string;
  intro: string;
  children: ReactNode;
};

export function LegalShell({ kicker, title, effective, intro, children }: Props) {
  return (
    <>
      <Navbar />
      <main className="bg-ink-950 pb-24 pt-24">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <header className="border-b border-white/[0.06] pb-10">
            <MonoLabel rule>{kicker}</MonoLabel>
            <h1 className="mt-4 text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[60px]">
              {title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
              <span>Effective {effective}</span>
              <span aria-hidden className="h-3 w-px bg-white/15" />
              <Link
                href="/contact"
                className="text-ink-200/70 transition hover:text-bone"
              >
                Questions?
              </Link>
            </div>
            <p className="mt-8 max-w-[60ch] text-[15px] leading-relaxed text-ink-200/80">
              {intro}
            </p>
          </header>

          <article className="legal-prose mt-10">{children}</article>

          <p className="mt-16 border-t border-white/[0.06] pt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
            Plain-language summary at the top of each section. The legal text
            controls if anything conflicts.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
