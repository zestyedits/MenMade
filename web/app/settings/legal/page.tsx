import {
  ArrowUpRight,
  ShieldCheck,
  FileText,
  EnvelopeSimple,
  PackageIcon,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Section } from "../../components/ui/Section";

const APP_VERSION = "0.1.0-build-md";

const LINK_CARDS = [
  {
    href: "/terms",
    icon: FileText,
    label: "Terms of use",
    desc: "Rules of the road. Plain-language summaries up top, legal text below.",
  },
  {
    href: "/privacy",
    icon: ShieldCheck,
    label: "Privacy policy",
    desc: "What we collect, what we don't, and how to take your data with you.",
  },
  {
    href: "/contact",
    icon: EnvelopeSimple,
    label: "Contact",
    desc: "Press, partnerships, bug reports, or honest feedback.",
  },
];

const LEGAL_SECTIONS = [
  {
    title: "Code of conduct",
    body: "Squad chat allows roasting. It does not allow harassment, threats, doxxing, slurs, or sexual content involving minors. Hard floors auto-block at send. Soft floors get flagged. Repeat offenders get rate-limited before bans, except for hard floors. Enforcement appeals go through the contact page.",
  },
  {
    title: "User-generated content",
    body: "You retain ownership of every message, stamp, and field-log entry you write. You grant MenMade a non-exclusive license to display that content within squads you've posted to, only for as long as the squad exists or until you delete it. We don't republish your content elsewhere.",
  },
  {
    title: "DMCA / copyright",
    body: "If something on the platform infringes your copyright, send a takedown via the contact page. We respond within 5 business days and document every takedown for the App Store / Play Store appeals trail.",
  },
  {
    title: "Subscription & refund (when applicable)",
    body: "Free tier today. When paid plans launch: cancel any time from the Subscription tab. Refund policy will be posted before any charge runs. App Store / Play Store subscriptions follow Apple/Google refund policy by their rules, not ours.",
  },
];

export default function LegalSettingsPage() {
  return (
    <>
      <Section
        kicker="01 / Documents"
        title="The signed paperwork"
        description="The things you actually agreed to (or are agreeing to by using the product). Open in a new tab so you don't lose your spot in settings."
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {LINK_CARDS.map(({ href, icon: Icon, label, desc }) => (
            <li key={href}>
              <Link
                href={href}
                className="tactile group flex h-full flex-col gap-3 border border-white/10 bg-ink-900/40 p-5 transition hover:border-white/25"
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} weight="bold" className="text-bone" />
                  <ArrowUpRight
                    size={14}
                    weight="bold"
                    className="text-ink-300/60 transition group-hover:text-bone"
                  />
                </div>
                <div>
                  <div className="font-sans text-[15px] font-extrabold uppercase tracking-tight text-bone">
                    {label}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-200/80">
                    {desc}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="02 / Plain-language summary"
        title="The short version"
        description="Each section here is a TL;DR of the longer document. The longer document controls if anything conflicts."
      >
        <div className="flex flex-col divide-y divide-white/[0.06] border border-white/10 bg-ink-900/40">
          {LEGAL_SECTIONS.map((s) => (
            <div key={s.title} className="px-5 py-5">
              <h3 className="font-sans text-[15px] font-bold uppercase tracking-tight text-bone">
                {s.title}
              </h3>
              <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-ink-100/85">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        kicker="03 / Open source"
        title="What we build on"
        description="MenMade ships on top of a stack of open-source software. Honest acknowledgement of who's holding the floor up."
      >
        <ul className="flex flex-col divide-y divide-white/[0.05] border border-white/10 bg-ink-900/40">
          {[
            { name: "Next.js", license: "MIT" },
            { name: "React", license: "MIT" },
            { name: "Tailwind CSS", license: "MIT" },
            { name: "Framer Motion", license: "MIT" },
            { name: "Phosphor Icons", license: "MIT" },
            { name: "Geist Sans / Geist Mono", license: "OFL" },
          ].map((d) => (
            <li
              key={d.name}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="font-mono text-[12.5px] tracking-[0.05em] text-bone">
                {d.name}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300/65">
                {d.license}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-ink-300/65">
          Full attribution is shipped with the native app per Apple
          requirements. Web users can request the full SBOM via{" "}
          <Link
            href="/contact"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            the contact page
          </Link>
          .
        </p>
      </Section>

      <Section kicker="04 / Build" title="Version">
        <div className="flex flex-col gap-3 border border-white/10 bg-ink-900/40 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
              App version
            </span>
            <span className="font-mono text-[13px] tabular-nums text-bone">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
              Surface
            </span>
            <span className="font-mono text-[13px] text-bone">Web</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-300/65">
              Built by
            </span>
            <span className="font-mono text-[13px] text-bone">
              MenMade Co.
            </span>
          </div>
        </div>
      </Section>

      <Section kicker="05 / Reach us" title="Press, legal, support">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <li>
            <Link
              href="/contact"
              className="tactile flex flex-col gap-2 border border-white/10 bg-ink-900/40 p-4 transition hover:border-white/25"
            >
              <EnvelopeSimple size={16} weight="bold" className="text-bone" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
                Contact form
              </span>
              <span className="text-[12px] text-ink-300/75">
                One queue. We answer real messages.
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="tactile flex flex-col gap-2 border border-white/10 bg-ink-900/40 p-4 transition hover:border-white/25"
            >
              <Receipt size={16} weight="bold" className="text-bone" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
                DMCA takedown
              </span>
              <span className="text-[12px] text-ink-300/75">
                Use the contact form, mark subject &ldquo;DMCA&rdquo;.
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="tactile flex flex-col gap-2 border border-white/10 bg-ink-900/40 p-4 transition hover:border-white/25"
            >
              <PackageIcon size={16} weight="bold" className="text-bone" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
                Press kit
              </span>
              <span className="text-[12px] text-ink-300/75">
                Logo lockup, brand-voice doc, screenshots on request.
              </span>
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
}
