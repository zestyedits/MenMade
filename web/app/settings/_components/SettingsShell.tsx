"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  IdentificationCard,
  Bell,
  Lock,
  ShieldCheck,
  Eye,
  CreditCard,
  Scales,
} from "@phosphor-icons/react/dist/ssr";

const TABS = [
  { href: "/settings/account", label: "Account", Icon: User },
  { href: "/settings/profile", label: "Profile", Icon: IdentificationCard },
  { href: "/settings/notifications", label: "Notifications", Icon: Bell },
  { href: "/settings/privacy", label: "Privacy & data", Icon: Lock },
  { href: "/settings/safety", label: "Safety", Icon: ShieldCheck },
  { href: "/settings/accessibility", label: "Accessibility", Icon: Eye },
  { href: "/settings/billing", label: "Subscription", Icon: CreditCard },
  { href: "/settings/legal", label: "Legal & about", Icon: Scales },
];

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-10 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.32em] text-ember-400/85">
          Operative / control
        </p>
        <h1 className="mt-2 text-balance text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[44px]">
          Settings
        </h1>
        <p className="mt-3 max-w-[60ch] text-[14px] leading-relaxed text-ink-200/80">
          Tune the product to your run. Everything stays on this device unless
          you say so.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Sidebar — vertical on desktop, scrollable horizontal pills on mobile */}
        <nav aria-label="Settings sections" className="lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-1 lg:flex-col lg:gap-0 lg:border-0 lg:pb-0">
            {TABS.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex shrink-0 items-center gap-2.5 px-3 py-2.5 transition lg:px-4 lg:py-3 ${
                      active
                        ? "text-bone lg:bg-ink-900/60"
                        : "text-ink-200/70 hover:text-bone"
                    }`}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-1 h-px bg-ember-400 lg:inset-y-2 lg:inset-x-auto lg:bottom-auto lg:left-0 lg:h-auto lg:w-[2px]"
                      />
                    ) : null}
                    <Icon
                      size={15}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-ember-400" : "text-ink-300/70"}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tab content */}
        <main className="min-w-0">
          <div className="flex flex-col gap-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
