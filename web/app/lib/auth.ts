"use client";

import { createClient } from "./supabase/client";

const LEGACY_SESSION_KEY = "menmade.session.v1";

export type Session = {
  userId: string;
  email: string;
  handle: string;
  name: string;
  signedInAt: number;
};

type AuthResult = { ok: true; userId: string } | { ok: false; error: string };

/**
 * Read the current session. Joins auth.users with the user's profile row
 * so we can return handle + display name in one shot.
 *
 * Returns null when the user is not signed in. Returns a partial Session
 * (empty handle/name) when signed in but onboarding hasn't created the
 * profile row yet — callers should treat that as "must complete onboarding."
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Clean up any stale legacy localStorage session from earlier builds.
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_SESSION_KEY);
    }
    return null;
  }

  // Fetch the profile row. RLS ensures the user can only see their own.
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    handle: profile?.handle ?? "",
    name: profile?.display_name ?? user.user_metadata?.display_name ?? "",
    signedInAt: user.last_sign_in_at
      ? Date.parse(user.last_sign_in_at)
      : Date.now(),
  };
}

/**
 * Email + password sign-in. Errors carry user-safe strings.
 * Login enumeration is mitigated by Supabase's default messaging.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Sign-in failed." };
  }
  return { ok: true, userId: data.user.id };
}

/**
 * Email + password sign-up. Sets display_name in user_metadata so the
 * onboarding flow can prefill it; the user picks their handle later
 * during onboarding (we don't auto-generate to avoid squatting).
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult & { needsEmailConfirmation?: boolean }> {
  const supabase = createClient();
  // Prefer the server-configured app URL (deterministic, matches Supabase
  // Redirect URLs allowlist). Fall back to window.origin only if unset.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const emailRedirectTo = `${appUrl}/auth/sign-in?confirmed=1`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo,
    },
  });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Sign-up failed." };
  }
  // Supabase returns session=null when email confirmation is required.
  const needsEmailConfirmation = !data.session;
  return { ok: true, userId: data.user.id, needsEmailConfirmation };
}

/**
 * Request a password reset email. Enumeration-resistant: returns
 * success regardless of whether the email exists (Supabase enforces this).
 */
export async function resetPasswordForEmail(email: string): Promise<AuthResult> {
  const supabase = createClient();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/sign-in?reset=1`,
  });
  if (error) {
    // Even on error, return ok to the UI to avoid enumeration leaks.
    console.warn("[auth] resetPasswordForEmail error:", error.message);
  }
  return { ok: true, userId: "" };
}

/**
 * Sign out of this device. Supabase handles cookie + token cleanup.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  }
}
