import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works — MenMade",
  description:
    "Five moves: enlist, take the brief, get matched, run the cycle, finish or get out. Walk the loop before you start.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How it works — MenMade",
    description:
      "The whole product runs on five surfaces. Watch them work, then run them yourself.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
