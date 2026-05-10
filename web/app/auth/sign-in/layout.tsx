import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — MenMade",
  description: "Report for duty. Sign back into your MenMade squad.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
