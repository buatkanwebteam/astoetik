import "server-only";
import { isSupabaseEnabled } from "@/lib/env";
import { createLocalDb } from "./local";
import { createSupabaseDb } from "./supabase";
import type { Db } from "./types";

let instance: Db | null = null;

/** Returns the Supabase-backed store when env is set, else the local demo store. */
export function getDb(): Db {
  instance ??= isSupabaseEnabled ? createSupabaseDb() : createLocalDb();
  return instance;
}

export type { Db } from "./types";
