"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Navbar() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 80], [6, 14]);
  const tint = useTransform(scrollY, [0, 80], [0.0, 0.55]);

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
          background: useTransform(
            tint,
            (v) => `rgb(12 10 9 / ${v})`,
          ),
        }}
      />
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative grid h-8 w-8 place-items-center">
            <span className="absolute inset-0 rounded-[10px] border border-white/15" />
            <span className="absolute inset-[3px] rounded-[6px] bg-gradient-to-br from-ember-400/90 to-ember-700/70" />
            <span className="relative font-mono text-[11px] font-semibold text-ink-950">
              M
            </span>
          </span>
          <span className="text-[15px] font-medium tracking-tight text-bone">
            MenMade
          </span>
          <span className="ml-1 hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300/70 sm:inline">
            est&middot;26
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            href="#impact"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-ink-100/70 transition hover:text-bone md:inline-flex"
          >
            The case
          </Link>
          <Link
            href="#how"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-ink-100/70 transition hover:text-bone md:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="#proof"
            className="hidden rounded-full px-3 py-1.5 text-[13px] text-ink-100/70 transition hover:text-bone md:inline-flex"
          >
            Squads
          </Link>
          <Link
            href="#start"
            className="tactile group inline-flex items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-[13px] font-medium text-ink-950 ring-1 ring-inset ring-white/10 transition hover:bg-white"
          >
            Start a squad
            <ArrowUpRight
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
