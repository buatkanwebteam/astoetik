import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseEnabled } from "@/lib/env";

/**
 * Login brute-force guard: MAX_FAILS wrong passwords from one IP lock that IP out for LOCK_MS.
 * A correct login clears the counter. Failures also expire after LOCK_MS of quiet.
 *
 * State lives in the `login_attempts` table (Supabase) so it is shared by every serverless instance
 * and survives restarts. Without Supabase, or while the table does not exist yet, it falls back to
 * process memory (one instance only), so login never breaks because of the guard.
 */

export const MAX_FAILS = 3;
export const LOCK_MS = 10 * 60 * 1000;

interface Attempt {
  failures: number;
  lockedUntil: number; // epoch ms, 0 = not locked
  updatedAt: number; // epoch ms
}

export interface LockStatus {
  locked: boolean;
  retryAfterSec: number;
}

// ---- memory fallback (kept on globalThis so dev hot reload does not reset it) ----
const g = globalThis as unknown as { __loginAttempts?: Map<string, Attempt> };
const memory = (g.__loginAttempts ??= new Map<string, Attempt>());

let client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  client ??= createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

async function read(key: string): Promise<Attempt | null> {
  const db = sb();
  if (db) {
    const { data, error } = await db.from("login_attempts").select("failures, locked_until, updated_at").eq("key", key).maybeSingle();
    if (!error) {
      return data
        ? {
            failures: Number(data.failures) || 0,
            lockedUntil: data.locked_until ? Date.parse(String(data.locked_until)) : 0,
            updatedAt: data.updated_at ? Date.parse(String(data.updated_at)) : 0,
          }
        : null;
    }
    console.error("[lockout] read failed, using memory:", error.message);
  }
  return memory.get(key) ?? null;
}

async function write(key: string, a: Attempt): Promise<void> {
  const db = sb();
  if (db) {
    const { error } = await db.from("login_attempts").upsert({
      key,
      failures: a.failures,
      locked_until: a.lockedUntil ? new Date(a.lockedUntil).toISOString() : null,
      updated_at: new Date(a.updatedAt).toISOString(),
    });
    if (!error) return;
    console.error("[lockout] write failed, using memory:", error.message);
  }
  memory.set(key, a);
  if (memory.size > 10_000) memory.clear();
}

async function remove(key: string): Promise<void> {
  memory.delete(key);
  const db = sb();
  if (db) {
    const { error } = await db.from("login_attempts").delete().eq("key", key);
    if (error) console.error("[lockout] delete failed:", error.message);
  }
}

/** Is this key locked right now? */
export async function checkLock(key: string): Promise<LockStatus> {
  const a = await read(key);
  const now = Date.now();
  if (a && a.lockedUntil > now) return { locked: true, retryAfterSec: Math.ceil((a.lockedUntil - now) / 1000) };
  return { locked: false, retryAfterSec: 0 };
}

/** Count one wrong password. Returns whether this attempt triggered the lock and how many tries remain. */
export async function recordFailure(key: string): Promise<LockStatus & { remaining: number }> {
  const now = Date.now();
  const prev = await read(key);
  // An expired lock or a quiet period starts a fresh count.
  const stale = !prev || now - prev.updatedAt > LOCK_MS || (prev.lockedUntil > 0 && prev.lockedUntil <= now);
  const failures = (stale ? 0 : prev.failures) + 1;
  const lockedUntil = failures >= MAX_FAILS ? now + LOCK_MS : 0;
  await write(key, { failures, lockedUntil, updatedAt: now });
  return lockedUntil
    ? { locked: true, retryAfterSec: Math.ceil(LOCK_MS / 1000), remaining: 0 }
    : { locked: false, retryAfterSec: 0, remaining: MAX_FAILS - failures };
}

/** A successful login wipes the counter. */
export async function clearFailures(key: string): Promise<void> {
  await remove(key);
}

export function formatWait(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s} detik`;
  return s === 0 ? `${m} menit` : `${m} menit ${s} detik`;
}
