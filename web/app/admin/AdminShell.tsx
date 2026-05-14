import type { ReactNode } from "react";

/**
 * Admin shell. Pure server markup — no client interactivity at the
 * frame level. Sits inside DashboardChrome (provided by /admin/layout.tsx)
 * but renders its own header so admin pages read as a distinct surface,
 * not just another /settings tab.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-10 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
          Command / oversight
        </p>
        <h1 className="mt-2 text-balance text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[44px]">
          Admin
        </h1>
        <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-ink-200/80">
          The control deck. Numbers are live. Actions hit production data.
          Don&rsquo;t click things you can&rsquo;t justify in a refund email.
        </p>
      </header>

      <div className="flex flex-col gap-12">{children}</div>
    </div>
  );
}
