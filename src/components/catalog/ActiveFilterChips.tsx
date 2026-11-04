"use client";

import { X } from "lucide-react";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilterChips({ chips, onClearAll }: { chips: FilterChip[]; onClearAll: () => void }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filter aktif">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          aria-label={`Hapus filter ${c.label}`}
          className="group flex items-center gap-1.5 rounded-sm border border-kat-line bg-kat-card py-1.5 pl-2.5 pr-2 text-xs text-kat-text transition-colors duration-150 hover:border-aksen"
        >
          {c.label}
          <X className="size-3.5 text-kat-muted transition-colors duration-150 group-hover:text-aksen-text" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="px-2 py-1.5 text-xs text-kat-muted underline-offset-4 transition-colors duration-150 hover:text-kat-text hover:underline"
      >
        Hapus semua
      </button>
    </div>
  );
}
