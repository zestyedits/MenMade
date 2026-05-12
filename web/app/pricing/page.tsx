import { createClient } from "../lib/supabase/server";
import PricingClient from "./PricingClient";

/**
 * /pricing — Server Component shell. Fetches the live Founder's
 * Pass tally on the server (no flash of stale "87 / 500"), then
 * hands the interactive UI to the client component.
 *
 * Falls back to (0, 500) if the count view is missing or errors,
 * which is honest enough — better than displaying a hardcoded
 * pre-launch placeholder.
 */
export const metadata = {
  title: "Pricing — MenMade",
  description:
    "Free forever. Operator $14/mo or $129/yr. Founder's Pass $299 one-time, capped at 500.",
};

// Live count — don't statically prerender the seat number.
export const dynamic = "force-dynamic";

async function fetchFounderCount(): Promise<{ claimed: number; cap: number }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("founder_seats_taken_count")
      .select("claimed,cap")
      .maybeSingle();
    if (error || !data) return { claimed: 0, cap: 500 };
    return { claimed: data.claimed, cap: data.cap };
  } catch {
    return { claimed: 0, cap: 500 };
  }
}

export default async function PricingPage() {
  const { claimed, cap } = await fetchFounderCount();
  return <PricingClient founderClaimed={claimed} founderCap={cap} />;
}
