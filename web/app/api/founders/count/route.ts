import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

/**
 * GET /api/founders/count
 *
 * Public, unauthenticated. Returns the live Founder's Pass tally:
 *   { claimed: number, cap: 500 }
 *
 * Reads the `founder_seats_taken_count` view (one row, two ints).
 * Cached for 30 seconds with a 60-second stale-while-revalidate
 * window — fresh enough that the pricing page never lies about the
 * cap, cheap enough that we don't hammer Postgres on every page
 * view.
 */

// Mark dynamic so headers().get('cache-control') below doesn't get
// overridden by the build-time prerender.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("founder_seats_taken_count")
    .select("claimed,cap")
    .maybeSingle();

  if (error || !data) {
    // Fail soft. The pricing page can still render with a stale
    // number — better than blowing up the public-facing site.
    console.error("[founders/count] view query failed:", error);
    return NextResponse.json(
      { claimed: 0, cap: 500, stale: true },
      {
        status: 200,
        headers: {
          "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  }

  return NextResponse.json(
    { claimed: data.claimed, cap: data.cap },
    {
      status: 200,
      headers: {
        "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
