import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enlist — MenMade",
  description:
    "Cut a new ID. Two minutes of intake, then you're in a squad and a cycle.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
