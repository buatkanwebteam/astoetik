"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, startSession, verifyCredentials } from "@/lib/auth/session";
import { clientIp } from "@/lib/ratelimit";
import { LOCK_MS, checkLock, clearFailures, formatWait, recordFailure } from "@/lib/auth/lockout";
import { headers } from "next/headers";

export interface LoginState {
  error: string | null;
}

const schema = z.object({
  email: z.string().trim().min(1, "Username wajib diisi."),
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
  const lockKey = `login:${ip}`;
  const lock = await checkLock(lockKey);
  if (lock.locked) {
    return { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${formatWait(lock.retryAfterSec)}.` };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const { email, password, next } = parsed.data;
  const ok = await verifyCredentials(email, password).catch(() => false);
  if (!ok) {
    const fail = await recordFailure(lockKey);
    if (fail.locked) return { error: `Login gagal 3 kali. Coba lagi dalam ${formatWait(Math.round(LOCK_MS / 1000))}.` };
    return { error: `Username atau password salah. Sisa percobaan: ${fail.remaining}.` };
  }

  await clearFailures(lockKey);
  await startSession(email);
  redirect(safeNext(next));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
