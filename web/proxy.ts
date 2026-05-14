import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy (Next 16 renamed `middleware` to `proxy`). Runs before every
 * matched request. Three responsibilities:
 *
 *  1. Origin allow-list on state-changing /api/* calls. CSRF defense:
 *     any non-GET hitting an /api/ route must come from a known origin.
 *     Same-origin POSTs from our own forms pass; cross-site attempts fail.
 *
 *  2. Refresh the Supabase session for PAGE requests. Server Components
 *     can't write cookies, so this runs on every page request via the
 *     @supabase/ssr helper. Without it, signed-in users get bumped to
 *     "signed out" the moment their access token rolls over.
 *
 *  3. Auth-gate protected page routes. Visitors hitting /dashboard,
 *     /chat, /squads, /onboarding, /settings, /field-log without a
 *     session get redirected to /auth/sign-in.
 *
 * /api/* routes skip the session-refresh dance because route handlers
 * call `await createClient()` themselves when they need the session.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/chat",
  "/squads",
  "/squad",
  "/onboarding",
  "/settings",
  "/field-log",
  // /admin is signed-in-gated here. The actual admin-allowlist check
  // happens inside requireAdmin() (app/lib/admin.ts) at the page level
  // — proxy doesn't read ADMIN_EMAILS so we keep middleware cheap and
  // the admin set out of the edge runtime's env scope.
  "/admin",
];

const ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXT_PUBLIC_APP_URL ?? "",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean),
);

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // ---------- 1. Origin allow-list for state-changing /api/* requests
  // The Stripe webhook is intentionally exempt: Stripe's servers
  // are the caller, they send no Origin header (so the `if (origin)`
  // branch already skips them), but we exclude the path explicitly
  // so future changes here can't accidentally block signed webhooks.
  const isWebhook = pathname === "/api/billing/webhook";
  if (
    isApi &&
    !isWebhook &&
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "OPTIONS"
  ) {
    const origin = request.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      // Also allow Vercel preview deploys on the current host.
      const host = request.headers.get("host") ?? "";
      const sameHost =
        origin === `https://${host}` || origin === `http://${host}`;
      if (!sameHost) {
        return Response.json(
          { ok: false, error: "Origin not allowed." },
          { status: 403 },
        );
      }
    }
  }

  // Skip Supabase session-refresh on /api/* — route handlers refresh
  // their own session via createClient(). Avoids cookie-mutation
  // weirdness that breaks API route matching.
  if (isApi) return NextResponse.next();

  // Also skip session-refresh on /auth/* — these pages handle their own
  // auth flow client-side (sign-in, sign-up, password recovery, callback).
  // Critically, password-recovery and email-confirmation links arrive
  // here with a `?code=` PKCE param that must be consumed by the CLIENT
  // (via exchangeCodeForSession). If the server client touches it first
  // during session refresh, the code is burned and the page can never
  // verify — manifests as the reset-password page hanging in "Verifying."
  if (pathname.startsWith("/auth/")) return NextResponse.next();

  // ---------- 2. Supabase session refresh (page routes only)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------- 3. Protected-route gate
  if (isProtectedPath(pathname) && !user) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
