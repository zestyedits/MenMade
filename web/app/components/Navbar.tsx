"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./ui/Logo";
import { PrimaryCta } from "./PrimaryCta";
import { useIsSignedIn } from "../lib/use-auth";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Field log", href: "/#proof" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 80], [6, 14]);
  const tint = useTransform(scrollY, [0, 80], [0.0, 0.55]);

  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const auth = useIsSignedIn();
  const isSignedIn = auth === "signed-in";
  // When signed in, the logo routes to /dashboard so users never get
  // accidentally bounced into the marketing landing page mid-session.
  const logoHref = isSignedIn ? "/dashboard" : "/";

  // Close mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Smooth-scroll handler for same-page hash links. If the link points to
  // /#section and we're already on the homepage, prevent the default jump
  // and animate-scroll to the target. Respects prefers-reduced-motion.
  function handleHashClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (typeof window === "undefined") return;
    if (!href.startsWith("/#")) return;
    if (pathname !== "/") return; // let Next.js handle cross-page nav
    const id = href.slice(2);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", `#${id}`);
    setOpen(false);
  }

  // Lock body scroll while menu is open + close on Esc.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <motion.header
      className="sticky top-0 z-40 w-full"
      style={{
        backdropFilter: useTransform(blur, (v) => `blur(${v}px) saturate(140%)`),
        WebkitBackdropFilter: useTransform(
          blur,
          (v) => `blur(${v}px) saturate(140%)`,
        ),
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 border-b border-white/[0.04]"
        style={{
          background: useTransform(tint, (v) => `rgb(12 10 9 / ${v})`),
        }}
      />

      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10"
      >
        <Logo size="md" href={logoHref} />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={(e) => handleHashClick(e, href)}
                className="group relative inline-flex px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-100/75 transition-colors duration-200 hover:text-bone"
              >
                {label}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-bone transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          {isSignedIn ? (
            <PrimaryCta href="/dashboard" flat>
              Open dashboard
            </PrimaryCta>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-ink-100/75 transition hover:text-bone md:inline-flex"
              >
                Sign in
              </Link>
              <PrimaryCta href="/auth/sign-up" flat>
                Sign up
              </PrimaryCta>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="tactile inline-flex shrink-0 items-center justify-center border border-white/15 p-2 text-bone transition hover:border-white/30 md:hidden"
          >
            {open ? (
              <X size={16} weight="bold" />
            ) : (
              <List size={16} weight="bold" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-30 bg-ink-950/85 backdrop-blur-md md:hidden"
              aria-hidden
            />
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="absolute inset-x-0 top-16 z-40 border-b border-white/[0.06] bg-ink-950/95 backdrop-blur-xl md:hidden"
            >
              <div className="mx-auto max-w-[1400px] px-5 py-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-ember-400/85">
                  Navigate
                </div>
                <ul className="mt-4 flex flex-col divide-y divide-white/[0.06] border-y border-white/[0.06]">
                  {NAV_LINKS.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={(e) => handleHashClick(e, href)}
                        className="flex items-center justify-between py-4 font-sans text-[20px] font-extrabold uppercase tracking-tight text-bone transition-colors duration-200 hover:text-ember-400"
                      >
                        {label}
                        <ArrowUpRight
                          size={18}
                          weight="bold"
                          className="text-ink-300/60 transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3">
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 bg-bone px-4 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-ink-950 transition hover:bg-white"
                    >
                      Open dashboard
                      <ArrowUpRight size={14} weight="bold" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/sign-in"
                        className="inline-flex items-center justify-center border border-white/15 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-bone transition hover:border-white/30"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="inline-flex items-center justify-center gap-2 bg-bone px-4 py-3 font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-ink-950 transition hover:bg-white"
                      >
                        Sign up
                        <ArrowUpRight size={14} weight="bold" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
