import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseEnabled } from "@/lib/env";
import { SESSION_COOKIE, SESSION_TTL_SEC, signSession, verifySession, type SessionPayload } from "./token";

export async function getSession(): Promise<SessionPayload | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For server components: redirect to /login when not signed in. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** For route handlers: returns a 401 response when not signed in. */
export async function requireApiSession(): Promise<Response | null> {
  return (await getSession()) ? null : Response.json({ error: "Tidak terautentikasi." }, { status: 401 });
}

/**
 * Supabase mode: verify against Supabase Auth (admin user created in the
 * Supabase dashboard). Demo mode: compare with DEMO_ADMIN_* env.
 */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  if (isSupabaseEnabled && env.supabaseAnonKey) {
    const sb = createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false } });
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return !error;
  }
  return email.toLowerCase() === env.demoEmail.toLowerCase() && password === env.demoPassword;
}

export async function startSession(email: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
