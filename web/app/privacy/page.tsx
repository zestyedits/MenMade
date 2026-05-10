import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — MenMade",
  description:
    "What MenMade collects, what we don't, and how to get your data out. Plain-language summaries up top.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "May 10, 2026";

export default function PrivacyPage() {
  return (
    <LegalShell
      kicker="Legal / 002"
      title="Privacy policy"
      effective={EFFECTIVE}
      intro="What MenMade collects, what we don't, why we collect it, and how to get your data out. We've written plain-language summaries at the top of each section. The legal text controls if anything conflicts."
    >
      <p className="placeholder">
        Placeholder draft — replace with attorney-reviewed text before public
        launch. Make sure it reflects your final stack (auth provider,
        analytics, payments, email) before publishing.
      </p>

      <h2>1. The short version</h2>
      <p className="summary">
        Summary: We collect what we need to run the squad app. We
        don&rsquo;t sell your data. You can delete your account.
      </p>
      <p>
        We collect account information you give us (email, name), product
        usage we observe (cycles joined, days completed), and a small set of
        technical data (IP address, browser type) to keep the service
        working. We don&rsquo;t sell or rent your personal data to anyone.
      </p>

      <h2>2. What we collect</h2>
      <h3>Account data</h3>
      <ul>
        <li>Email address</li>
        <li>Display name and handle</li>
        <li>Password hash (we never store your raw password)</li>
        <li>Authentication-provider ID, if you sign in with Apple or Google</li>
      </ul>

      <h3>Product data</h3>
      <ul>
        <li>Squads you join, cycles you start, objectives you complete</li>
        <li>Field-log entries, photos, and messages you post</li>
        <li>Streaks, completion timestamps, opt-in body metrics</li>
      </ul>

      <h3>Technical data</h3>
      <ul>
        <li>IP address, browser, operating system, device type</li>
        <li>Pages visited, features used, error events</li>
        <li>Cookies and local storage entries (see Section 6)</li>
      </ul>

      <h2>3. What we don&rsquo;t collect</h2>
      <p className="summary">
        Summary: No precise location, no contacts, no third-party tracking
        pixels.
      </p>
      <ul>
        <li>We do not collect precise GPS location.</li>
        <li>We do not access your contact list, photo library, or calendar without explicit per-action permission.</li>
        <li>We do not embed third-party advertising trackers.</li>
      </ul>

      <h2>4. Why we collect it</h2>
      <p className="summary">
        Summary: To make the product work, keep it secure, and improve it.
      </p>
      <ul>
        <li>To run the service (you can&rsquo;t join a squad without an account).</li>
        <li>To prevent abuse, fraud, and security incidents.</li>
        <li>To send transactional email (sign-in, password reset, squad notifications).</li>
        <li>To improve the product based on aggregate, anonymized usage.</li>
      </ul>

      <h2>5. Who we share it with</h2>
      <p className="summary">
        Summary: A small set of vendors who run the boring parts of the
        product.
      </p>
      <p className="placeholder">
        REPLACE: List actual subprocessors once chosen — hosting (Vercel),
        auth (Supabase / Clerk / etc.), email (Resend / Mailgun / etc.),
        analytics (if any), error monitoring (Sentry, etc.).
      </p>
      <p>
        We share data only with vendors that support running the service,
        under contracts that limit their use of your data to that purpose.
        We disclose data when legally compelled, and we&rsquo;ll tell you
        when we&rsquo;re allowed to.
      </p>

      <h2>6. Cookies and local storage</h2>
      <p className="summary">
        Summary: We use them for sign-in and remembering preferences. No
        ad-tech.
      </p>
      <p>
        We use first-party cookies and browser local storage to keep you
        signed in, remember your preferences, and prevent abuse. We do not
        use third-party advertising cookies.
      </p>

      <h2>7. Your rights</h2>
      <p className="summary">
        Summary: You can see your data, export it, fix it, or delete it.
      </p>
      <ul>
        <li>Access — request a copy of your data</li>
        <li>Correction — fix anything inaccurate</li>
        <li>Deletion — delete your account and the data tied to it</li>
        <li>Portability — export your field log in a standard format</li>
        <li>Objection — opt out of any non-essential processing</li>
      </ul>
      <p>
        Use the in-app settings, or <a href="/contact">send a brief</a>.
        We&rsquo;ll respond within 30 days.
      </p>

      <h2>8. Data retention</h2>
      <p className="summary">
        Summary: We keep your data while your account is active. Then we
        delete it.
      </p>
      <p>
        Account data is retained while your account is active and deleted or
        anonymized within 90 days of account closure, except where we&rsquo;re
        legally required to keep it longer (tax records, fraud prevention).
      </p>

      <h2>9. Children</h2>
      <p className="summary">Summary: Adults only.</p>
      <p>
        MenMade is not directed at children under 18. We do not knowingly
        collect personal data from anyone under 18. If you believe a child
        has signed up, write us and we&rsquo;ll delete the account.
      </p>

      <h2>10. International transfers</h2>
      <p className="placeholder">
        REPLACE: Insert SCCs / DPF / equivalent transfer mechanism details
        once your hosting and vendor footprint is finalized.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        announced in the product and via email at least 14 days before they
        take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions or requests? <a href="/contact">Send a brief</a> and
        we&rsquo;ll route it to the right person.
      </p>
    </LegalShell>
  );
}
