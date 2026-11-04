"use client";

import { useEffect } from "react";
import { track } from "./track";

/** Records page_view, plus qr_scan once per browser session when opened via ?src=qr. */
export function PageTracker({ productCode, serial, fromQr }: { productCode: string; serial?: string; fromQr: boolean }) {
  useEffect(() => {
    // Unit pages tag their events with the serial; the product code stays the analytics key.
    const unit: Record<string, string> = serial ? { serial } : {};
    track(productCode, "page_view", { referrer: document.referrer || null, ...unit });
    if (!fromQr) return;
    const key = `astera:qr:${productCode}${serial ? `:${serial}` : ""}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: still count it
    }
    track(productCode, "qr_scan", unit);
    // Drop ?src=qr so a refresh or shared link isn't counted as another scan.
    const url = new URL(window.location.href);
    url.searchParams.delete("src");
    window.history.replaceState(null, "", url.toString());
  }, [productCode, serial, fromQr]);
  return null;
}
