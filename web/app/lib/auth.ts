"use client";

const KEY = "menmade.session.v1";

export type Session = {
  email: string;
  handle: string;
  name: string;
  signedInAt: number;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signIn(input: {
  email: string;
  name?: string;
  handle?: string;
}): Session {
  const session: Session = {
    email: input.email,
    handle:
      input.handle ??
      input.email.split("@")[0].replace(/[^a-z0-9_-]/gi, "").toLowerCase(),
    name: input.name ?? input.email.split("@")[0],
    signedInAt: Date.now(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut(): void {
  window.localStorage.removeItem(KEY);
}
