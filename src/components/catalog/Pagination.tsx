"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageList } from "@/lib/catalog";

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const edge =
    "flex h-10 items-center gap-1 rounded-sm border border-kat-muted/40 bg-kat-card px-3 text-sm font-medium text-kat-text transition-colors duration-150 hover:border-kat-text disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Halaman katalog" className="flex items-center justify-center gap-1">
      <button type="button" className={edge} onClick={() => onChange(page - 1)} disabled={page === 1}>
        <ChevronLeft className="size-4" aria-hidden />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>
      <ol className="flex items-center gap-1">
        {pageList(page, total).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} className="grid size-10 place-items-center font-mono text-sm text-kat-text" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Halaman ${p}`}
                className={`grid size-10 place-items-center rounded-sm border font-mono text-sm tabular-nums transition-colors duration-150 ${
                  p === page
                    ? "border-aksen-deep bg-aksen-deep font-semibold text-on-aksen shadow-sm"
                    : "border-kat-muted/40 bg-kat-card text-kat-text hover:border-kat-text"
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <button type="button" className={edge} onClick={() => onChange(page + 1)} disabled={page === total}>
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
