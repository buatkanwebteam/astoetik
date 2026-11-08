"use client";

import type { ReactNode } from "react";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import type { ProductCategory } from "@/types";
import {
  CERT_LABEL,
  MATERIAL_SWATCH,
  facetCounts,
  type CatalogItem,
  type Certification,
  type Filters,
  type PriceBounds,
} from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";

const PRICE_STEP = 5_000;

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function CategoryNav({
  items,
  categoryLabel,
  value,
  onChange,
}: {
  items: CatalogItem[];
  categoryLabel: Record<ProductCategory, string>;
  value: Filters["category"];
  onChange: (c: Filters["category"]) => void;
}) {
  const counts = facetCounts(items, (i) => i.category);
  const options: [Filters["category"], string, number][] = [
    ["all", "Semua produk", items.length],
    ...(Object.keys(categoryLabel) as ProductCategory[]).map(
      (c) => [c, categoryLabel[c], counts.get(c) ?? 0] as [ProductCategory, string, number],
    ),
  ];

  return (
    <nav aria-label="Kategori produk">
      <p className="mb-2 font-grotesk text-xs font-medium text-kat-muted">Kategori</p>
      <ul className="space-y-px">
        {options.map(([key, label, count]) => {
          const active = value === key;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={active ? "true" : undefined}
                className={`flex w-full items-center justify-between border-l-2 px-3 py-2 text-left text-sm transition-colors duration-150 ${
                  active
                    ? "border-aksen bg-aksen/10 font-medium text-kat-text"
                    : "border-transparent text-kat-muted hover:border-kat-line hover:text-kat-text"
                }`}
              >
                {label}
                <span className="font-mono text-xs tabular-nums text-kat-muted">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Section({ title, badge, defaultOpen, children }: { title: string; badge?: number; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-kat-line py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 font-grotesk text-sm font-medium text-kat-text [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {badge ? (
            <span className="rounded-sm bg-aksen/20 px-1.5 font-mono text-[11px] tabular-nums text-aksen-text">{badge}</span>
          ) : null}
        </span>
        <ChevronDown className="size-4 text-kat-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

function CheckRow({
  checked,
  disabled,
  onChange,
  label,
  count,
  swatch,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  label: ReactNode;
  count: number;
  swatch?: string;
}) {
  return (
    <label
      className={`flex items-center gap-3 py-1.5 text-sm ${
        disabled ? "cursor-not-allowed text-kat-muted/50" : "cursor-pointer text-kat-muted hover:text-kat-text"
      }`}
    >
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <span
        className={`grid size-4 shrink-0 place-items-center rounded-[3px] border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fokus ${
          checked ? "border-aksen bg-aksen text-on-aksen" : "border-kat-line bg-kat-bg"
        }`}
        aria-hidden
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {swatch && <span className="size-3 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: swatch }} aria-hidden />}
      <span className={`flex-1 ${checked ? "text-kat-text" : ""}`}>{label}</span>
      <span className="font-mono text-xs tabular-nums">{count}</span>
    </label>
  );
}

function PriceRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: PriceBounds;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const span = bounds.max - bounds.min || 1;
  const left = ((min - bounds.min) / span) * 100;
  const right = 100 - ((max - bounds.min) / span) * 100;
  const clamp = (v: number) => Math.min(bounds.max, Math.max(bounds.min, Number.isFinite(v) ? v : bounds.min));

  return (
    <div>
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-kat-line" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-aksen" style={{ left: `${left}%`, right: `${right}%` }} />
        <input
          type="range"
          className="dual-range"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={min}
          onChange={(e) => onChange(Math.min(Number(e.target.value), max), max)}
          aria-label="Harga minimum"
        />
        <input
          type="range"
          className="dual-range"
          min={bounds.min}
          max={bounds.max}
          step={PRICE_STEP}
          value={max}
          onChange={(e) => onChange(min, Math.max(Number(e.target.value), min))}
          aria-label="Harga maksimum"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(
          [
            ["Min", min, (v: number) => onChange(Math.min(clamp(v), max), max)],
            ["Maks", max, (v: number) => onChange(min, Math.max(clamp(v), min))],
          ] as const
        ).map(([label, value, set]) => (
          <label key={label} className="block">
            <span className="mb-1 block text-[11px] text-kat-muted">{label} (Rp)</span>
            <input
              type="number"
              inputMode="numeric"
              min={bounds.min}
              max={bounds.max}
              step={PRICE_STEP}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full rounded-sm border border-kat-line bg-kat-card px-2.5 py-2 font-mono text-sm tabular-nums text-kat-text transition-colors duration-150 focus:outline-none"
            />
          </label>
        ))}
      </div>
      <p className="mt-2 font-mono text-[11px] text-kat-muted">
        {formatRupiah(min)} – {formatRupiah(max)}
      </p>
    </div>
  );
}

export function FilterSidebar({
  items,
  bounds,
  draft,
  onDraftChange,
  onApply,
  onReset,
  dirty,
  activeCount,
}: {
  /** Items within the current category; drives option counts. */
  items: CatalogItem[];
  bounds: PriceBounds;
  draft: Filters;
  onDraftChange: (next: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  dirty: boolean;
  activeCount: number;
}) {
  const controls = facetCounts(items, (i) => i.control);
  const materials = facetCounts(items, (i) => i.material);
  const watts = facetCounts(items, (i) => i.watt);
  const certs = new Map<Certification, number>([
    ["sni", items.filter((i) => i.sni).length],
    ["tkdn", items.filter((i) => i.tkdn !== null).length],
  ]);
  const set = (patch: Partial<Filters>) => onDraftChange({ ...draft, ...patch });
  const priceDirty = draft.priceMin !== bounds.min || draft.priceMax !== bounds.max;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-kat-line pb-3">
        <h2 className="flex items-center gap-2 font-grotesk text-sm font-semibold">
          Filter
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-aksen px-1 font-mono text-[11px] tabular-nums text-on-aksen">
              {activeCount}
            </span>
          )}
        </h2>
        {dirty && <span className="text-[11px] text-fokus">Belum diterapkan</span>}
      </div>

      <Section title="Kontrol panas" badge={draft.controls.length} defaultOpen>
        {[...controls].map(([value, count]) => (
          <CheckRow
            key={value}
            label={value}
            count={count}
            checked={draft.controls.includes(value)}
            disabled={count === 0}
            onChange={() => set({ controls: toggle(draft.controls, value) })}
          />
        ))}
      </Section>

      <Section title="Bahan" badge={draft.materials.length} defaultOpen>
        {[...materials].map(([value, count]) => (
          <CheckRow
            key={value}
            label={value}
            count={count}
            swatch={MATERIAL_SWATCH[value]}
            checked={draft.materials.includes(value)}
            disabled={count === 0}
            onChange={() => set({ materials: toggle(draft.materials, value) })}
          />
        ))}
      </Section>

      <Section title="Daya" badge={draft.watts.length} defaultOpen>
        <div className="flex flex-wrap gap-2">
          {[...watts]
            .sort((a, b) => a[0] - b[0])
            .map(([value, count]) => {
              const on = draft.watts.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ watts: toggle(draft.watts, value) })}
                  title={`${count} produk`}
                  className={`min-w-16 rounded-sm border px-3 py-2 font-mono text-xs tabular-nums transition-colors duration-150 ${
                    on
                      ? "border-aksen bg-aksen/15 text-kat-text"
                      : "border-kat-line text-kat-muted hover:border-kat-muted hover:text-kat-text"
                  }`}
                >
                  {value} W
                </button>
              );
            })}
        </div>
      </Section>

      <Section title="Harga" badge={priceDirty ? 1 : 0}>
        <PriceRange
          bounds={bounds}
          min={draft.priceMin}
          max={draft.priceMax}
          onChange={(priceMin, priceMax) => set({ priceMin, priceMax })}
        />
      </Section>

      <Section title="Sertifikasi" badge={draft.certs.length}>
        {[...certs].map(([value, count]) => (
          <CheckRow
            key={value}
            label={CERT_LABEL[value]}
            count={count}
            checked={draft.certs.includes(value)}
            disabled={count === 0}
            onChange={() => set({ certs: toggle(draft.certs, value) })}
          />
        ))}
      </Section>

      <div className="sticky bottom-0 flex gap-2 bg-kat-card pt-5 pb-2">
        <button
          type="button"
          onClick={onApply}
          disabled={!dirty}
          className="flex-1 rounded-sm bg-aksen-deep px-4 py-2.5 font-grotesk text-sm font-semibold text-on-aksen transition-colors duration-150 hover:bg-aksen disabled:cursor-not-allowed disabled:bg-kat-raised disabled:text-kat-muted"
        >
          Terapkan filter
        </button>
        <button
          type="button"
          onClick={onReset}
          className="grid size-[42px] place-items-center rounded-sm border border-kat-line text-kat-muted transition-colors duration-150 hover:border-kat-muted hover:text-kat-text"
          aria-label="Reset semua filter"
          title="Reset semua filter"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
