import Link from "next/link";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { MonoLabel } from "./components/ui/MonoLabel";

export const metadata = {
  title: "Not found — MenMade",
  description: "The page you're looking for isn't where you left it.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden bg-ink-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgb(239 123 53 / 0.06) 0%, transparent 60%)",
          }}
        />

        <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-[1400px] flex-col justify-center px-5 py-20 md:px-10 md:py-28">
          <div className="grid grid-cols-12 items-end gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-7">
              <MonoLabel rule>Field report / 404</MonoLabel>
              <h1 className="mt-5 text-balance font-sans text-[clamp(3rem,9vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-bone">
                <span className="text-ember-400">Off-grid.</span>
              </h1>
              <h2 className="mt-4 text-balance font-sans text-[clamp(1.4rem,3vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-bone">
                The page you&rsquo;re looking for isn&rsquo;t where you left
                it.
              </h2>
              <p className="mt-5 max-w-[55ch] text-[15px] leading-relaxed text-ink-200/80">
                Either the link is stale, the page hasn&rsquo;t been built yet,
                or you typed something the universe doesn&rsquo;t recognize.
                Receipts beat opinions; navigate back to known ground.
              </p>
            </div>

            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="tactile group inline-flex items-center justify-between gap-2 bg-bone px-5 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-ink-950 transition hover:bg-white"
                >
                  Back to base
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/cycles"
                  className="inline-flex items-center justify-between gap-2 border border-white/15 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
                >
                  Browse cycles
                  <MagnifyingGlass size={13} weight="bold" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-between gap-2 border border-white/15 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
                >
                  Report a broken link
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom strip — anchors the page like a real document */}
          <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.06] pt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/60">
            <span>
              Status code{" "}
              <span className="font-bold tabular-nums text-bone">404</span>
            </span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>Not found</span>
            <span aria-hidden className="h-3 w-px bg-white/15" />
            <span>No squad on file at this address</span>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
