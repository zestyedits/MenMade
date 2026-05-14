"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChatCircle,
  Compass,
  ListBullets,
  UsersThree,
  SignOut,
  CaretDown,
  GearSix,
  User,
  ShieldStar,
} from "@phosphor-icons/react/dist/ssr";
import { Logo } from "../components/ui/Logo";
import { TieredAvatar } from "../components/ui/TieredAvatar";
import { signOut, type Session } from "../lib/auth";
import { useTier } from "../lib/use-tier";

/**
 * One-shot admin probe. Returns true only after the /api/admin/check
 * endpoint confirms 200. False until then. Cached for the lifetime of
 * the component (one fetch per mount, no re-poll).
 */
function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/check", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!cancelled && res.ok) setIsAdmin(true);
      } catch {
        // Network failure → assume not admin. The /admin route still
        // gates server-side, so a false negative just hides the link.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return isAdmin;
}

// Nav options are built one at a time. Adding to this array brings the
// option online in both the desktop top nav and the mobile bottom nav.
const navOptions = [
  { href: "/chat", label: "Chat", Icon: ChatCircle },
  { href: "/squad", label: "Squad", Icon: UsersThree },
  { href: "/cycles", label: "Cycles", Icon: Compass },
  { href: "/field-log/new", label: "Log", Icon: ListBullets },
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
  const tier = useTier();
  const isAdmin = useIsAdmin();
  const tierLine = (() => {
    if (tier === "loading" || tier.plan === "free") return null;
    if (tier.plan === "founder") {
      const seat = tier.founderSeatNumber;
      return seat
        ? `Founder · seat ${String(seat).padStart(3, "0")}/500`
        : "Founder";
    }
    return tier.plan === "operator-annual"
      ? "Operator · annual"
      : "Operator · monthly";
  })();
  const isFounder = tier !== "loading" && tier.plan === "founder";

  async function handleSignOut() {
    await signOut();
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
              <TieredAvatar name={session.name} tier={tier} size="sm" />
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
                    {tierLine ? (
                      <div
                        className={`mt-2 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.22em] ${
                          isFounder ? "text-ember-400" : "text-bone/80"
                        }`}
                      >
                        {tierLine}
                      </div>
                    ) : null}
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
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-left text-[13px] text-ember-400/90 transition hover:bg-white/[0.04] hover:text-ember-400"
                    >
                      Admin
                      <ShieldStar size={14} weight="bold" />
                    </Link>
                  ) : null}
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
