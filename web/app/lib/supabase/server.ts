import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for use inside route handlers, server
 * components, and middleware. Reads + writes the user's session via
 * the Next.js cookies() API so the same auth state works across
 * server and client.
 *
 * RLS still applies — this client uses the anon key + the user's
 * cookie-borne JWT, NOT the service role key.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll was called from a Server Component. Server Components
            // can read cookies but can't write them — that's expected.
            // The middleware refresh flow handles cookie writes instead.
          }
        },
      },
    },
  );
}
