"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, startSession, verifyCredentials } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

export interface LoginState {
  error: string | null;
}

const schema = z.object({
  email: z.email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  next: z.string().optional(),
});

function safeNext(next: string | undefined): string {
  // Only allow internal dashboard paths to avoid open redirects.
  return next && next.startsWith("/dashboard") && !next.startsWith("//") ? next : "/dashboard";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = clientIp(new Request("http://x", { headers: h }));
  if (!rateLimit(`login:${ip}`, 10, 10 * 60 * 1000).ok) {
    return { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const { email, password, next } = parsed.data;
  const ok = await verifyCredentials(email, password).catch(() => false);
  if (!ok) return { error: "Email atau password salah." };

  await startSession(email);
  redirect(safeNext(next));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
