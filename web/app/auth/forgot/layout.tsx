import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password — MenMade",
  description: "Request a one-time link to reset your MenMade password.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
