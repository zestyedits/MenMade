import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MenMade",
  description:
    "Free, Operator at $14/mo, and a one-time Founder's Pass capped at 500 seats. No fake urgency, no trial-trap pricing.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — MenMade",
    description:
      "Free tier permanent. Operator at $14/mo or $129/yr. Founder's Pass at $299 (500 seats).",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
