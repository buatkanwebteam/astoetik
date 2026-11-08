"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HoldDelete } from "./HoldDelete";

/** Delete one QR/unit by holding the button. Deleting is permanent. */
export function DeleteQrButton({ code, serial, compact = false }: { code: string; serial: string; compact?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(code)}/units/${encodeURIComponent(serial)}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal menghapus QR.");
        return;
      }
      // Let the "Terhapus" state show before the row disappears.
      window.setTimeout(() => router.refresh(), 700);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <HoldDelete onConfirm={() => void remove()} compact={compact} />
      {error && (
        <p role="alert" className="text-[11px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
