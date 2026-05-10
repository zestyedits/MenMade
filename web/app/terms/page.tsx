import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Use — MenMade",
  description:
    "The rules of the road for using MenMade. Plain-language summaries up top, full legal text below.",
  alternates: { canonical: "/terms" },
};

const EFFECTIVE = "May 10, 2026";

export default function TermsPage() {
  return (
    <LegalShell
      kicker="Legal / 001"
      title="Terms of use"
      effective={EFFECTIVE}
      intro="These are the rules of the road for using MenMade. We've written plain-language summaries at the top of each section. The legal text controls if anything conflicts. By using the app you agree to all of it."
    >
      <p className="placeholder">
        Placeholder draft — replace with attorney-reviewed text before public
        launch. The structure below is the skeleton; the wording is not legal
        advice.
      </p>

      <h2>1. Who we are</h2>
      <p className="summary">Summary: MenMade is a product of MenMade Co.</p>
      <p>
        MenMade (&ldquo;MenMade&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is
        a private squad app for accountability cycles, operated by MenMade Co.
        Questions? <a href="/contact">Send a brief</a>.
      </p>

      <h2>2. Your account</h2>
      <p className="summary">
        Summary: One human, one account. Don&rsquo;t lend it to your roommate.
      </p>
      <p>
        You must be at least 18 years old, or of legal majority in your
        jurisdiction, to use MenMade. You are responsible for keeping your
        login credentials secure and for everything that happens under your
        account.
      </p>

      <h2>3. What you agree to do (and not do)</h2>
      <p className="summary">
        Summary: Don&rsquo;t harass, don&rsquo;t cheat, don&rsquo;t
        impersonate, don&rsquo;t scrape.
      </p>
      <ul>
        <li>You will not harass, threaten, or abuse other operatives.</li>
        <li>
          You will not falsify field-log entries, photos, or completion data.
        </li>
        <li>You will not impersonate other users or MenMade staff.</li>
        <li>
          You will not scrape, reverse-engineer, or attempt to extract bulk
          data from the service.
        </li>
        <li>
          You will not upload illegal content, malware, or anything you
          don&rsquo;t have the right to share.
        </li>
      </ul>

      <h2>4. Squads and content</h2>
      <p className="summary">
        Summary: You own your stuff. You give us permission to display it
        inside the squad you posted it to.
      </p>
      <p>
        You retain ownership of the field-log entries, photos, and messages
        you post. You grant MenMade a non-exclusive, worldwide, royalty-free
        license to host, display, and transmit that content within the
        product, solely for the purpose of operating the service.
      </p>

      <h2>5. Subscriptions and payment</h2>
      <p className="summary">
        Summary: If you pay, you can cancel. Refunds follow the policy below.
      </p>
      <p className="placeholder">
        REPLACE: Insert subscription tiers, billing cadence, refund policy,
        and trial terms once pricing is set.
      </p>

      <h2>6. Termination</h2>
      <p className="summary">
        Summary: Either of us can end this. We&rsquo;ll tell you why.
      </p>
      <p>
        We may suspend or terminate your access if you violate these terms.
        You may close your account at any time from{" "}
        <a href="/settings">settings</a>. Some sections of these terms survive
        termination (warranties, liability, indemnity).
      </p>

      <h2>7. Disclaimers</h2>
      <p className="summary">
        Summary: We try hard. We can&rsquo;t guarantee every Tuesday.
      </p>
      <p>
        The service is provided &ldquo;as is&rdquo; without warranties of any
        kind, express or implied, including merchantability, fitness for a
        particular purpose, and non-infringement, to the maximum extent
        permitted by law.
      </p>

      <h2>8. Limitation of liability</h2>
      <p className="summary">
        Summary: If something goes wrong, our total liability is capped.
      </p>
      <p className="placeholder">
        REPLACE: Insert jurisdiction-appropriate cap (commonly fees paid in
        the prior 12 months) once counsel has reviewed.
      </p>

      <h2>9. Changes to these terms</h2>
      <p className="summary">
        Summary: We&rsquo;ll tell you before anything material changes.
      </p>
      <p>
        We may update these terms from time to time. Material changes will be
        announced in the product and via email at least 14 days before they
        take effect. Continued use after the effective date constitutes
        acceptance.
      </p>

      <h2>10. Governing law and disputes</h2>
      <p className="placeholder">
        REPLACE: Insert governing-law and dispute-resolution clauses based on
        the entity&rsquo;s state of incorporation.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms? <a href="/contact">Send a brief</a> and
        we&rsquo;ll route it to the right person.
      </p>
    </LegalShell>
  );
}
