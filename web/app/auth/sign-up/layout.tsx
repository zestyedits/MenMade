import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — MenMade",
  description:
    "Create your account. Two minutes of setup, then you're in a squad and a cycle.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
