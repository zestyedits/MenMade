import type { ReactNode } from "react";
import { Logo } from "../components/ui/Logo";
import { LiveDot } from "../components/ui/LiveDot";
import { MonoLabel } from "../components/ui/MonoLabel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1fr_minmax(420px,520px)]">
      {/* Brand panel — hidden on mobile, asymmetric on desktop */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 10%, rgb(239 123 53 / 0.10) 0%, transparent 60%), linear-gradient(180deg, rgb(20 17 15 / 1) 0%, rgb(12 10 9 / 1) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgb(239 123 53 / 0.4) 50%, transparent 100%)",
          }}
        />

        <div className="relative flex min-h-[100dvh] flex-col p-12">
          <Logo size="md" />

          <div className="mt-auto flex flex-col gap-8">
            <MonoLabel rule>Operative / authenticating</MonoLabel>

            <h2 className="max-w-[14ch] text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone">
              Stop scrolling. <span className="text-ember-400">Start cycling.</span>
            </h2>

            <p className="max-w-[44ch] text-[14px] leading-relaxed text-ink-200/75">
              A private squad app for men who&rsquo;d rather finish a real thing
              than scroll a fake one. Built quietly, used loudly.
            </p>

            <div className="flex items-center gap-4 border-t border-white/[0.06] pt-6">
              <LiveDot />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/70">
                1,847 squads in cycle
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <section className="relative flex min-h-[100dvh] flex-col bg-ink-950">
        {/* Mobile-only logo strip */}
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4 lg:hidden">
          <Logo size="sm" />
          <MonoLabel>Operative / auth</MonoLabel>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-12 md:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </section>
    </main>
  );
}
