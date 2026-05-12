import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cycles — MenMade",
  description:
    "Curated cycle templates. Pick one that finishes — 14, 30, 60, or 90 days. Real challenges, real squads.",
  alternates: { canonical: "/cycles" },
  openGraph: {
    title: "Cycles — MenMade",
    description:
      "Pick a fight worth picking. 12 curated cycle templates running 14 to 90 days.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
