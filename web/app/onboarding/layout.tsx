import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take the brief — MenMade",
  description: "Four questions. We use the answers to put you in the right squad.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
