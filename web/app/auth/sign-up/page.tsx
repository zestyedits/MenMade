"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AppleLogo, GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { MonoLabel } from "../../components/ui/MonoLabel";
import { signIn } from "../../lib/auth";

type Errors = { name?: string; email?: string; password?: string };

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Doesn't look like an email.";
    if (!password) next.password = "Required.";
    else if (password.length < 8)
      next.password = "At least 8 characters. We're not joking.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      signIn({ email, name });
      router.push("/onboarding");
    }, 360);
  }

  function handleProvider(provider: "apple" | "google") {
    setSubmitting(true);
    setTimeout(() => {
      signIn({
        email: `new-operative@${provider}.local`,
        name: provider === "apple" ? "Apple Operative" : "Google Operative",
      });
      router.push("/onboarding");
    }, 240);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <MonoLabel ember>Enlist / 001</MonoLabel>
        <h1 className="text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[40px]">
          Cut a new ID.
        </h1>
        <p className="text-[14px] leading-relaxed text-ink-200/75">
          Two minutes of intake. Then you&rsquo;re in a squad.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => handleProvider("apple")}
          disabled={submitting}
        >
          <AppleLogo size={16} weight="fill" />
          Continue with Apple
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => handleProvider("google")}
          disabled={submitting}
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
        <Input
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="What should the squad call you?"
        />
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
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="At least 8 characters. Make it something a stranger can't guess."
          placeholder="Build a real one"
        />

        <Button type="submit" fullWidth disabled={submitting} className="mt-2">
          {submitting ? "Enlisting..." : "Enlist"}
          {!submitting ? <ArrowRight size={14} weight="bold" /> : null}
        </Button>

        <p className="text-center text-[12px] leading-relaxed text-ink-300/70">
          By enlisting you agree to our{" "}
          <Link
            href="/terms"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-[13px] text-ink-300/80">
        Already enlisted?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-bone underline underline-offset-4 decoration-bone/40 hover:decoration-bone"
        >
          Report for duty.
        </Link>
      </p>
    </div>
  );
}
