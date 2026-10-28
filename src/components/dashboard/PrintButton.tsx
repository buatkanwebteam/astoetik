"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg bg-tanah-600 px-4 py-2 text-sm font-semibold text-white dark:bg-emas dark:text-tanah-900"
    >
      <Printer className="size-4" aria-hidden /> Cetak
    </button>
  );
}
