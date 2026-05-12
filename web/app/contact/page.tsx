"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, ShieldCheck, Lightning, Bug } from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MonoLabel } from "../components/ui/MonoLabel";

type Errors = { name?: string; email?: string; subject?: string; body?: string };
type SubmitState = "idle" | "submitting" | "sent" | "error";

const REASONS = [
  { Icon: ShieldCheck, label: "Press & partnerships" },
  { Icon: Bug, label: "Bug reports & feedback" },
  { Icon: Lightning, label: "Squad lead applications" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SubmitState>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Required.";
    if (!email.trim()) next.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Doesn't look like an email.";
    if (!subject.trim()) next.subject = "Required.";
    if (!body.trim()) next.body = "Tell us what's up.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState("submitting");
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `website` is the honeypot. Real users never see this field
        // (it's not in the form). Bots that POST every key will fill it.
        body: JSON.stringify({ name, email, subject, body, website: "" }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setServerError(data?.error ?? "Something broke on our end.");
        setState("error");
        return;
      }

      setState("sent");
    } catch {
      setServerError("Network is grumpy. Try again in a minute.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <>
        <Navbar />
        <main className="bg-ink-950 pb-32 pt-24">
          <div className="mx-auto max-w-[1100px] px-5 md:px-10">
            <div className="flex flex-col gap-6 border border-white/[0.06] bg-ink-900/40 p-10 md:p-14">
              <CheckCircle size={32} weight="fill" className="text-ember-400" />
              <MonoLabel ember>Brief received / 001</MonoLabel>
              <h1 className="text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[60px]">
                Got it.
              </h1>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-200/80">
                Your brief is in the queue. We answer real messages in 1–3
                business days. We&rsquo;ll write back to{" "}
                <span className="text-bone">{email}</span>.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                <Button href="/">Back to base</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setSubject("");
                    setBody("");
                    setState("idle");
                  }}
                >
                  Send another
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-ink-950 pb-24 pt-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 md:px-10 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-5">
            <MonoLabel rule>Contact / 001</MonoLabel>
            <h1 className="mt-4 text-balance text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight text-bone md:text-[60px]">
              Send a brief.
            </h1>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-relaxed text-ink-200/80">
              Press, partnerships, bug reports, or honest feedback. We answer
              real messages. We ignore the rest.
            </p>

            <ul className="mt-10 flex flex-col divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {REASONS.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-4 py-4 text-[14px] text-ink-100/85"
                >
                  <Icon
                    size={18}
                    weight="bold"
                    className="text-ember-400/80"
                    aria-hidden
                  />
                  {label}
                </li>
              ))}
            </ul>

            <p className="mt-8 max-w-[44ch] text-[12.5px] leading-relaxed text-ink-300/70">
              Replies typically arrive within 1–3 business days. We do not
              share your email with anyone.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 border border-white/[0.06] bg-ink-900/40 p-6 md:p-8 lg:col-span-7"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <Input
              label="Subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
              placeholder="One line. Like a headline."
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="i-body"
                className="text-[13px] font-medium text-bone"
              >
                Message
              </label>
              <textarea
                id="i-body"
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-invalid={errors.body ? true : undefined}
                aria-describedby={errors.body ? "i-body-err" : undefined}
                placeholder="Skip the pleasantries. What's the ask?"
                className={`block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30 ${
                  errors.body ? "border-ember-400/60" : ""
                }`}
              />
              {errors.body ? (
                <p
                  id="i-body-err"
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
                >
                  {errors.body}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
              <p className="text-[12px] text-ink-300/70">
                Submissions go straight to the team. Expect a reply in 1–3
                business days.
              </p>
              <Button type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? "Sending..." : "Send brief"}
                {state === "submitting" ? null : (
                  <ArrowRight size={14} weight="bold" />
                )}
              </Button>
            </div>

            {state === "error" && serverError ? (
              <p
                role="alert"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
              >
                {serverError}
              </p>
            ) : null}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
