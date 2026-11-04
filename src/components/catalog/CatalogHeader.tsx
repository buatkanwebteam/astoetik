"use client";

import { ArrowUpDown, ChevronDown, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { SORT_LABEL, type SortKey } from "@/lib/catalog";

export type CatalogView = "grid" | "table";

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Urutkan</span>
      <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-kat-muted" aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-10 appearance-none rounded-sm border border-kat-line bg-kat-card pl-9 pr-9 text-sm text-kat-text transition-colors duration-150 hover:border-kat-muted focus:border-aksen focus:outline-none"
      >
        {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {SORT_LABEL[k]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-kat-muted" aria-hidden />
    </label>
  );
}

export function CatalogToolbar({
  query,
  onQuery,
  shown,
  total,
  sort,
  onSort,
  view,
  onView,
  activeCount,
  onOpenFilters,
}: {
  query: string;
  onQuery: (q: string) => void;
  shown: number;
  total: number;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  view: CatalogView;
  onView: (v: CatalogView) => void;
  activeCount: number;
  onOpenFilters: () => void;
}) {
  const views: [CatalogView, string, typeof LayoutGrid][] = [
    ["grid", "Tampilan kartu", LayoutGrid],
    ["table", "Tampilan tabel", Rows3],
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-60">
          <label htmlFor="catalog-search" className="sr-only">
            Cari produk
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-kat-muted" aria-hidden />
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cari nama, kode, atau bahan"
            autoComplete="off"
            className="h-10 w-full rounded-sm border border-kat-line bg-kat-card pl-9 pr-10 text-sm text-kat-text placeholder:text-kat-muted transition-colors duration-150 hover:border-kat-muted focus:border-aksen focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-kat-muted hover:text-kat-text"
              aria-label="Kosongkan pencarian"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-10 items-center gap-2 rounded-sm border border-kat-line bg-kat-card px-3 text-sm text-kat-text transition-colors duration-150 hover:border-kat-muted xl:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filter
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-aksen px-1 font-mono text-[11px] tabular-nums text-on-aksen">
              {activeCount}
            </span>
          )}
        </button>
        <SortDropdown value={sort} onChange={onSort} />
        <div className="flex rounded-sm border border-kat-line bg-kat-card p-0.5" role="group" aria-label="Mode tampilan">
          {views.map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => onView(v)}
              aria-pressed={view === v}
              aria-label={label}
              title={label}
              className={`grid size-[34px] place-items-center rounded-[3px] transition-colors duration-150 ${
                view === v ? "bg-aksen-deep text-on-aksen" : "text-kat-muted hover:text-kat-text"
              }`}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-kat-muted" aria-live="polite">
        <span className="font-mono tabular-nums text-kat-text">{shown}</span> dari <span className="font-mono tabular-nums">{total}</span>{" "}
        produk
      </p>
    </div>
  );
}
