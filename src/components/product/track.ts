import type { EventType } from "@/types";

type Meta = Record<string, string | number | boolean | null>;

/** Fire-and-forget event; survives page unload (e.g. marketplace redirect). */
export function track(productCode: string, type: EventType, meta: Meta = {}) {
  const body = JSON.stringify({ productCode, type, meta });
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}
