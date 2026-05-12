"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AppleLogo, GoogleLogo, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { signInWithPassword } from "../../lib/auth";
import { store } from "../../lib/store";

type Errors = { email?: string; password?: string; general?: string };

type BannerKind = "confirm-email" | "confirmed" | "reset-sent" | null;

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<BannerKind>(null);
  const [bannerEmail, setBannerEmail] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("confirm") === "email") {
      setBanner("confirm-email");
      const to = searchParams.get("to");
      if (to) {
        setBannerEmail(to);
        setEmail(to);
      }
      return;
    }
    if (searchParams.get("confirmed") === "1") {
      setBanner("confirmed");
      return;
    }
    if (searchParams.get("reset") === "1") {
      setBanner("reset-sent");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!email.trim()) next.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Doesn't look like an email.";
    if (!password) next.password = "Required.";
    else if (password.length < 6) next.password = "At least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await signInWithPassword(email, password);
    if (!result.ok) {
      setErrors({ general: result.error });
      setSubmitting(false);
      return;
    }
    router.push(store.hasOnboarded() ? "/dashboard" : "/onboarding");
  }

  function handleProvider(provider: "apple" | "google") {
    // Apple / Google sign-in deferred to Phase 5 (App Store readiness).
    // Buttons stay in the UI but show a temporary "coming soon" toast.
    setErrors({
      general: `${
        provider === "apple" ? "Apple" : "Google"
      } sign-in is coming with the native app. Use email for now.`,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <MonoLabel ember>Sign in / 001</MonoLabel>
        <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
          Report for duty.
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-200/75">
          The cycle started without you. Catch up.
        </p>
      </header>

      {banner === "confirm-email" ? (
        <div
          role="status"
          className="flex items-start gap-3 border border-ember-400/40 bg-ember-400/[0.06] px-4 py-3.5"
        >
          <EnvelopeSimple
            size={18}
            weight="bold"
            className="mt-0.5 shrink-0 text-ember-400"
          />
          <div className="flex flex-col gap-1.5">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400">
              Check your inbox
            </div>
            <p className="text-[13.5px] leading-relaxed text-bone">
              We sent a confirmation link
              {bannerEmail ? (
                <>
                  {" "}to <span className="font-medium">{bannerEmail}</span>
                </>
              ) : null}
              . Click it, then come back here to sign in.
            </p>
            <p className="text-[12px] leading-relaxed text-ink-300/70">
              Didn&rsquo;t get it? Check spam, or wait 60 seconds and try again
              from the link below.
            </p>
          </div>
        </div>
      ) : null}

      {banner === "confirmed" ? (
        <div
          role="status"
          className="flex items-start gap-3 border border-bone/30 bg-bone/[0.04] px-4 py-3.5"
        >
          <CheckCircle
            size={18}
            weight="bold"
            className="mt-0.5 shrink-0 text-bone"
          />
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-bone">
              Email confirmed
            </div>
            <p className="text-[13.5px] leading-relaxed text-bone">
              You&rsquo;re cleared. Sign in to start your first cycle.
            </p>
          </div>
        </div>
      ) : null}

      {banner === "reset-sent" ? (
        <div
          role="status"
          className="flex items-start gap-3 border border-ember-400/40 bg-ember-400/[0.06] px-4 py-3.5"
        >
          <EnvelopeSimple
            size={18}
            weight="bold"
            className="mt-0.5 shrink-0 text-ember-400"
          />
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ember-400">
              Reset link sent
            </div>
            <p className="text-[13.5px] leading-relaxed text-bone">
              Check your inbox. Use the link to set a new password.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => handleProvider("apple")}
          disabled={submitting}
          aria-label="Continue with Apple"
        >
          <AppleLogo size={16} weight="fill" />
          Continue with Apple
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => handleProvider("google")}
          disabled={submitting}
          aria-label="Continue with Google"
        >
          <GoogleLogo size={16} weight="bold" />
          Continue with Google
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink-300/60">
          Or with email
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {errors.general ? (
          <div
            role="alert"
            className="border border-ember-400/60 bg-ember-400/[0.06] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
          >
            {errors.general}
          </div>
        ) : null}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="operative@example.com"
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="i-password"
              className="text-[13px] font-medium text-bone"
            >
              Password
            </label>
            <Link
              href="/auth/forgot"
              className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-300/70 hover:text-bone"
            >
              Forgot
            </Link>
          </div>
          <input
            id="i-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "i-password-err" : undefined}
            placeholder="At least 6 characters"
            className={`block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30 ${
              errors.password ? "border-ember-400/60" : ""
            }`}
          />
          {errors.password ? (
            <p
              id="i-password-err"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
            >
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={submitting}
          className="mt-2"
        >
          {submitting ? "Authenticating..." : "Enlist"}
          {!submitting ? <ArrowRight size={14} weight="bold" /> : null}
        </Button>
      </form>

      <p className="text-center text-[13px] text-ink-300/80">
        New here?{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
        >
          Cut a new ID.
        </Link>
      </p>
    </div>
  );
}
