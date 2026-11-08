import type { Product, ProductCategory } from "@/types";

// Catalog facets are derived from the real spec sheet, never invented.
// Stock and discount data do not exist in the source, so the catalog has none.

export interface CatalogItem {
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  material: string | null;
  control: string | null;
  watt: number | null;
  sni: boolean;
  tkdn: string | null;
  note: string | null;
}

export type Certification = "sni" | "tkdn";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

export const SORT_LABEL: Record<SortKey, string> = {
  featured: "Unggulan",
  "price-asc": "Harga: rendah ke tinggi",
  "price-desc": "Harga: tinggi ke rendah",
  "name-asc": "Nama: A–Z",
};

export const CERT_LABEL: Record<Certification, string> = {
  sni: "Bersertifikat SNI",
  tkdn: "Ada nilai TKDN",
};

// Swatch colors approximate each body material for the "Bahan" facet.
export const MATERIAL_SWATCH: Record<string, string> = {
  Alumunium: "#c9cdd3",
  Kayu: "#b07a45",
  Besi: "#4a4f58",
  "Tanah Liat": "#b5562f",
  Kuningan: "#c9a227",
  PVC: "#e5e7eb",
};

export interface Filters {
  category: ProductCategory | "all";
  controls: string[];
  materials: string[];
  watts: number[];
  certs: Certification[];
  priceMin: number;
  priceMax: number;
}

export interface PriceBounds {
  min: number;
  max: number;
}

const PRICE_STEP = 50_000;

function spec(p: Product, ...labels: string[]) {
  return p.specs.find((s) => labels.includes(s.label))?.value ?? null;
}

export function toCatalogItem(p: Product): CatalogItem {
  const wattRaw = spec(p, "Daya", "Daya Maks");
  const watt = wattRaw ? Number(/(\d+)\s*W/.exec(wattRaw)?.[1]) || null : null;
  return {
    code: p.code,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    material: spec(p, "Bahan Bodi", "Bahan Bodi Canting"),
    control: spec(p, "Kontrol Panas", "Pengaturan"),
    watt,
    sni: p.sni,
    tkdn: p.tkdn,
    note: p.note,
  };
}

export function priceBounds(items: CatalogItem[]): PriceBounds {
  if (items.length === 0) return { min: 0, max: PRICE_STEP };
  const prices = items.map((i) => i.price);
  return {
    min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
    max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
  };
}

export function emptyFilters(bounds: PriceBounds): Filters {
  return {
    category: "all",
    controls: [],
    materials: [],
    watts: [],
    certs: [],
    priceMin: bounds.min,
    priceMax: bounds.max,
  };
}

/** Facet values in the order they first appear, with how many items carry each. */
export function facetCounts<T extends string | number>(items: CatalogItem[], pick: (i: CatalogItem) => T | null) {
  const counts = new Map<T, number>();
  for (const item of items) {
    const v = pick(item);
    if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return counts;
}

/** Number of applied facet values; category is navigation, not a filter. */
export function activeFilterCount(f: Filters, bounds: PriceBounds) {
  const priceActive = f.priceMin !== bounds.min || f.priceMax !== bounds.max;
  return f.controls.length + f.materials.length + f.watts.length + f.certs.length + (priceActive ? 1 : 0);
}

function matchesQuery(item: CatalogItem, categoryLabel: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.code, categoryLabel, item.material ?? ""].some((s) => s.toLowerCase().includes(q));
}

export function applyCatalog(
  items: CatalogItem[],
  opts: {
    filters: Filters;
    query: string;
    sort: SortKey;
    categoryLabel: Record<ProductCategory, string>;
  },
) {
  const { filters: f, query, sort, categoryLabel } = opts;
  const result = items.filter(
    (i) =>
      (f.category === "all" || i.category === f.category) &&
      (f.controls.length === 0 || (i.control !== null && f.controls.includes(i.control))) &&
      (f.materials.length === 0 || (i.material !== null && f.materials.includes(i.material))) &&
      (f.watts.length === 0 || (i.watt !== null && f.watts.includes(i.watt))) &&
      (!f.certs.includes("sni") || i.sni) &&
      (!f.certs.includes("tkdn") || i.tkdn !== null) &&
      i.price >= f.priceMin &&
      i.price <= f.priceMax &&
      matchesQuery(i, categoryLabel[i.category], query),
  );

  const byName = (a: CatalogItem, b: CatalogItem) => a.name.localeCompare(b.name, "id");
  switch (sort) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price || byName(a, b));
    case "price-desc":
      return result.sort((a, b) => b.price - a.price || byName(a, b));
    case "name-asc":
      return result.sort(byName);
    default:
      return result;
  }
}

/** Page numbers with "…" gaps, e.g. [1, "…", 4, 5, 6, "…", 20]. */
export function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}
