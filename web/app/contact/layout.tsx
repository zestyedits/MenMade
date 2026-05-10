import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — MenMade",
  description:
    "Send a brief. Press, partnerships, bug reports, or honest feedback — we answer real messages.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — MenMade",
    description: "Send a brief.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact — MenMade",
    description: "Send a brief.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
