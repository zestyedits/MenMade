"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChatCircle,
  SignOut,
  CaretDown,
  GearSix,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "../components/ui/Logo";
import { Avatar } from "../components/ui/Avatar";
import { signOut, type Session } from "../lib/auth";

// Nav options are built one at a time. Adding to this array brings the
// option online in both the desktop top nav and the mobile bottom nav.
const navOptions = [
  { href: "/chat", label: "Chat", Icon: ChatCircle },
];

export function DashboardChrome({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSignOut() {
    signOut();
    router.replace("/auth/sign-in");
  }

  return (
    <div
      className={`flex min-h-[100dvh] flex-col bg-ink-950 ${
        navOptions.length > 0 ? "pb-[64px] md:pb-0" : ""
      }`}
    >
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <Logo size="md" />

          {/* Desktop nav options */}
          {navOptions.length > 0 ? (
            <nav className="hidden items-center gap-1 md:flex">
              {navOptions.map(({ href, label }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition ${
                      active ? "text-bone" : "text-ink-200/70 hover:text-bone"
                    }`}
                  >
                    {label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px bg-bone"
                      />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="group flex items-center gap-2.5 rounded-sm px-1 py-1 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/50"
            >
              <Avatar name={session.name} size="sm" />
              <span className="hidden text-[13px] text-bone/90 md:inline">
                {session.handle}
              </span>
              <CaretDown
                size={12}
                weight="bold"
                className="text-ink-300/70 transition group-hover:text-bone"
              />
            </button>

            {menuOpen ? (
              <>
                <button
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-2 w-56 border border-white/10 bg-ink-900 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)]"
                >
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/60">
                      Operative
                    </div>
                    <div className="mt-1 truncate text-[13px] font-medium text-bone">
                      {session.name}
                    </div>
                    <div className="truncate text-[12px] text-ink-300/70">
                      {session.email}
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-left text-[13px] text-bone/85 transition hover:bg-white/[0.04] hover:text-bone"
                  >
                    Dashboard
                    <User size={14} weight="bold" />
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-left text-[13px] text-bone/85 transition hover:bg-white/[0.04] hover:text-bone"
                  >
                    Settings
                    <GearSix size={14} weight="bold" />
                  </Link>
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-left text-[13px] text-bone/85 hover:bg-white/[0.04] hover:text-ember-400"
                  >
                    Sign out
                    <SignOut size={14} weight="bold" />
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      {/* Bottom nav only renders when at least one nav option exists */}
      {navOptions.length > 0 ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink-950/95 backdrop-blur-md md:hidden"
          aria-label="Primary"
        >
          <div
            className="mx-auto grid max-w-[700px]"
            style={{
              gridTemplateColumns: `repeat(${navOptions.length}, minmax(0, 1fr))`,
            }}
          >
            {navOptions.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex flex-col items-center justify-center gap-1 py-2.5 transition ${
                    active ? "text-bone" : "text-ink-300/70 hover:text-bone"
                  }`}
                >
                  <Icon size={20} weight={active ? "fill" : "regular"} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em]">
                    {label}
                  </span>
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-6 top-0 h-px bg-ember-400"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
