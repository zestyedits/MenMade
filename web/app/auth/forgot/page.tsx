"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { resetPasswordForEmail } from "../../lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Doesn't look like an email.");
      return;
    }
    setError(null);
    setSubmitting(true);
    // resetPasswordForEmail always returns ok to the UI (enumeration-resistant).
    await resetPasswordForEmail(email);
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-3">
          <CheckCircle size={28} weight="fill" className="text-ember-400" />
          <MonoLabel ember>Sent / 001</MonoLabel>
          <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
            Check your email.
          </h1>
          <p className="text-[14.5px] leading-relaxed text-ink-200/80">
            If <span className="text-bone">{email}</span> is on file with us,
            a one-time reset link is on the way. Link expires in 30 minutes.
          </p>
        </header>

        <div className="flex items-start gap-3 border border-white/[0.06] bg-ink-900/40 px-4 py-3">
          <EnvelopeSimple
            size={18}
            weight="fill"
            className="mt-0.5 shrink-0 text-bone"
          />
          <p className="text-[13px] leading-relaxed text-ink-200/85">
            Didn&rsquo;t arrive? Check spam, then{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-bone underline underline-offset-4 decoration-bone/40 transition hover:decoration-bone"
            >
              try a different address
            </button>
            .
          </p>
        </div>

        <Button href="/auth/sign-in" variant="secondary" fullWidth>
          <ArrowLeft size={14} weight="bold" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-3">
        <MonoLabel ember>Reset / 001</MonoLabel>
        <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
          Lost the password.
        </h1>
        <p className="text-[14.5px] leading-relaxed text-ink-200/80">
          Drop your email. We&rsquo;ll send a one-time link. If it&rsquo;s on
          file, you&rsquo;re back in within a minute.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          placeholder="you@example.com"
        />

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
          {!submitting ? <ArrowRight size={14} weight="bold" /> : null}
        </Button>

        <p className="text-center text-[13px] text-ink-300/80">
          Remember it now?{" "}
          <Link
            href="/auth/sign-in"
            className="font-medium text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Sign in instead.
          </Link>
        </p>
      </form>
    </div>
  );
}
