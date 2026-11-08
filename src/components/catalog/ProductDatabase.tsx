"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, Plus } from "lucide-react";
import type { Product, ProductCategory } from "@/types";
import {
  CERT_LABEL,
  activeFilterCount,
  applyCatalog,
  emptyFilters,
  priceBounds,
  toCatalogItem,
  type Filters,
  type SortKey,
} from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { PageHeader } from "@/components/dashboard/ui";
import { ActiveFilterChips, type FilterChip } from "./ActiveFilterChips";
import { CatalogToolbar, type CatalogView } from "./CatalogHeader";
import { Drawer } from "./Drawer";
import { CategoryNav, FilterSidebar } from "./FilterSidebar";
import { Pagination } from "./Pagination";
import { ProductCard, ProductGrid } from "./ProductCard";
import { DeleteProduct, PRODUCT_FORM_ID, ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";

const PAGE_SIZE = 12;

type Editor = { mode: "closed" } | { mode: "create" } | { mode: "edit"; code: string };

function sameFacets(a: Filters, b: Filters) {
  const eq = <T,>(x: T[], y: T[]) => x.length === y.length && x.every((v) => y.includes(v));
  return (
    eq(a.controls, b.controls) &&
    eq(a.materials, b.materials) &&
    eq(a.watts, b.watts) &&
    eq(a.certs, b.certs) &&
    a.priceMin === b.priceMin &&
    a.priceMax === b.priceMax
  );
}

export function ProductDatabase({
  products,
  categoryLabel,
}: {
  products: Product[];
  categoryLabel: Record<ProductCategory, string>;
}) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const items = useMemo(() => products.map(toCatalogItem), [products]);
  const bounds = useMemo(() => priceBounds(items), [items]);

  const [applied, setApplied] = useState<Filters>(() => emptyFilters(bounds));
  const [draft, setDraft] = useState<Filters>(() => emptyFilters(bounds));
  const [query, setQueryState] = useState("");
  const [sort, setSortState] = useState<SortKey>("featured");
  const [view, setView] = useState<CatalogView>("grid");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editor, setEditor] = useState<Editor>({ mode: "closed" });
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Every change to what is shown starts from page 1.
  const setQuery = (q: string) => {
    setQueryState(q);
    setPage(1);
  };
  const setSort = (s: SortKey) => {
    setSortState(s);
    setPage(1);
  };
  /** Changes made outside the filter form (chips, category) apply at once and keep the draft in sync. */
  const updateApplied = (fn: (f: Filters) => Filters) => {
    setApplied(fn);
    setDraft(fn);
    setPage(1);
  };
  const applyDraft = () => {
    setApplied(draft);
    setPage(1);
    setFiltersOpen(false);
  };
  const resetAll = () => {
    updateApplied((f) => ({ ...emptyFilters(bounds), category: f.category }));
    setQueryState("");
  };

  function openEditor(next: Editor) {
    setFormError(null);
    setEditor(next);
  }

  function finishMutation(message: string) {
    setEditor({ mode: "closed" });
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, text: message }));
    startRefresh(() => router.refresh());
  }

  const inCategory = applied.category === "all" ? items : items.filter((i) => i.category === applied.category);
  const results = applyCatalog(items, { filters: applied, query, sort, categoryLabel });
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const activeCount = activeFilterCount(applied, bounds);
  const dirty = !sameFacets(draft, applied);
  const editing = editor.mode === "edit" ? (products.find((p) => p.code === editor.code) ?? null) : null;

  const chips: FilterChip[] = [
    ...(query.trim() ? [{ key: "q", label: `“${query.trim()}”`, onRemove: () => setQuery("") }] : []),
    ...applied.controls.map((v) => ({
      key: `c-${v}`,
      label: `Kontrol ${v}`,
      onRemove: () => updateApplied((f) => ({ ...f, controls: f.controls.filter((x) => x !== v) })),
    })),
    ...applied.materials.map((v) => ({
      key: `m-${v}`,
      label: v,
      onRemove: () => updateApplied((f) => ({ ...f, materials: f.materials.filter((x) => x !== v) })),
    })),
    ...applied.watts.map((v) => ({
      key: `w-${v}`,
      label: `${v} W`,
      onRemove: () => updateApplied((f) => ({ ...f, watts: f.watts.filter((x) => x !== v) })),
    })),
    ...applied.certs.map((v) => ({
      key: `s-${v}`,
      label: CERT_LABEL[v],
      onRemove: () => updateApplied((f) => ({ ...f, certs: f.certs.filter((x) => x !== v) })),
    })),
    ...(applied.priceMin !== bounds.min || applied.priceMax !== bounds.max
      ? [
          {
            key: "price",
            label: `${formatRupiah(applied.priceMin)} – ${formatRupiah(applied.priceMax)}`,
            onRemove: () => updateApplied((f) => ({ ...f, priceMin: bounds.min, priceMax: bounds.max })),
          },
        ]
      : []),
  ];

  function goToPage(p: number) {
    setPage(p);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  const filterPanel = (
    <>
      <CategoryNav
        items={items}
        categoryLabel={categoryLabel}
        value={applied.category}
        onChange={(category) => updateApplied((f) => ({ ...f, category }))}
      />
      <div className="mt-6">
        <FilterSidebar
          items={inCategory}
          bounds={bounds}
          draft={draft}
          onDraftChange={setDraft}
          onApply={applyDraft}
          onReset={resetAll}
          dirty={dirty}
          activeCount={activeCount}
        />
      </div>
    </>
  );

  return (
    <>
    <PageHeader
      title="Katalog Produk"
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openEditor({ mode: "create" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-tanah-600 px-3 py-2 text-xs font-semibold text-white dark:bg-emas dark:text-tanah-900"
        >
          <Plus className="size-4" aria-hidden /> Tambah produk
        </button>
      </div>
    </PageHeader>
    <div className="grid items-start gap-6 font-sans text-kat-text xl:grid-cols-[16rem_minmax(0,1fr)]">
      <aside
        className="hidden rounded-md border border-kat-line bg-kat-card px-4 pt-5 xl:block"
        aria-label="Filter katalog"
      >
        {filterPanel}
      </aside>

      <section aria-label="Daftar produk" className="min-w-0">
        <div ref={resultsRef} className="scroll-mt-20">
          <CatalogToolbar
            query={query}
            onQuery={setQuery}
            shown={results.length}
            total={items.length}
            sort={sort}
            onSort={setSort}
            view={view}
            onView={setView}
            activeCount={activeCount}
            onOpenFilters={() => setFiltersOpen(true)}
          />
          <div className="mt-3 empty:hidden">
            <ActiveFilterChips chips={chips} onClearAll={resetAll} />
          </div>
        </div>

        <div className={`mt-5 transition-opacity duration-150 ${refreshing ? "opacity-60" : ""}`}>
          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-md border border-dashed border-kat-line bg-kat-card px-6 py-16 text-center">
              <PackageSearch className="size-8 text-kat-muted" aria-hidden />
              <p className="mt-4 font-grotesk text-lg font-semibold">
                {items.length === 0 ? "Belum ada produk" : "Tidak ada produk yang cocok"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-kat-muted">
                {items.length === 0
                  ? "Tambahkan produk pertama untuk membuat halaman dan QR-nya."
                  : "Coba longgarkan filter atau ubah kata kunci pencarian."}
              </p>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    resetAll();
                    updateApplied((f) => ({ ...f, category: "all" }));
                  }}
                  className="mt-5 h-10 rounded-sm border border-kat-line px-4 text-sm transition-colors duration-150 hover:border-aksen"
                >
                  Tampilkan semua produk
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <ProductGrid>
              {pageItems.map((item, i) => (
                <li key={item.code}>
                  <ProductCard
                    item={item}
                    categoryLabel={categoryLabel[item.category]}
                    priority={current === 1 && i < 3}
                    onEdit={() => openEditor({ mode: "edit", code: item.code })}
                  />
                </li>
              ))}
            </ProductGrid>
          ) : (
            <>
              <div className="hidden lg:block">
                <ProductTable
                  items={pageItems}
                  categoryLabel={categoryLabel}
                  onEdit={(code) => openEditor({ mode: "edit", code })}
                />
              </div>
              {/* The wide table needs lg; narrower screens fall back to cards. */}
              <div className="lg:hidden">
                <ProductGrid>
                  {pageItems.map((item, i) => (
                    <li key={item.code}>
                      <ProductCard
                        item={item}
                        categoryLabel={categoryLabel[item.category]}
                        priority={current === 1 && i < 3}
                        onEdit={() => openEditor({ mode: "edit", code: item.code })}
                      />
                    </li>
                  ))}
                </ProductGrid>
              </div>
            </>
          )}
        </div>

        <div className="mt-10">
          <Pagination page={current} total={totalPages} onChange={goToPage} />
        </div>
      </section>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" title="Filter">
        <div className="px-5 pt-5">{filterPanel}</div>
      </Drawer>

      <Drawer
        open={editor.mode !== "closed"}
        onClose={() => setEditor({ mode: "closed" })}
        side="right"
        wide
        title={editing ? `Edit ${editing.code}` : "Tambah produk"}
        footer={
          <div className="space-y-3">
            {formError && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {editing ? (
                <DeleteProduct code={editing.code} name={editing.name} onDeleted={finishMutation} onError={setFormError} />
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "closed" })}
                  className="h-10 rounded-sm border border-kat-line px-4 text-sm transition-colors duration-150 hover:border-kat-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form={PRODUCT_FORM_ID}
                  disabled={formBusy}
                  className="h-10 rounded-sm bg-aksen-deep px-5 font-grotesk text-sm font-semibold text-on-aksen transition-colors duration-150 hover:bg-aksen disabled:opacity-60"
                >
                  {formBusy ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        }
      >
        {editor.mode !== "closed" && (
          <ProductForm
            key={editor.mode === "edit" ? editor.code : "new"}
            product={editing}
            categoryLabel={categoryLabel}
            onSubmittingChange={setFormBusy}
            onSaved={finishMutation}
            onError={setFormError}
          />
        )}
      </Drawer>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        {toast && (
          <p key={toast.id} className="rounded-sm border border-kat-line bg-kat-card px-4 py-2.5 text-sm text-kat-text shadow-md">
            {toast.text}
          </p>
        )}
      </div>
    </div>
    </>
  );
}
