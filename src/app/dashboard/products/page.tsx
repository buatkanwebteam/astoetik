import type { Metadata } from "next";
import Link from "next/link";
import { Archive, Printer } from "lucide-react";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { CATEGORY_LABEL } from "@/data/products";
import { ProductDatabase } from "@/components/catalog/ProductDatabase";

export const metadata: Metadata = { title: "Katalog Produk" };

const secondary =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-tanah-700 ring-1 ring-tanah-900/15 transition hover:bg-tanah-50 dark:text-krem dark:ring-white/15 dark:hover:bg-white/10";

export default async function ProductsPage() {
  const db = getDb();
  const products = await db.listProducts();
  const localhost = /localhost|127\.0\.0\.1/.test(env.siteUrl);

  return (
    <div className="mx-auto max-w-[96rem]">
      {localhost && (
        <p role="note" className="mb-5 rounded-xl border border-emas bg-emas-soft/60 px-4 py-3 text-sm text-tanah-900">
          <strong>Perhatian:</strong> <code>NEXT_PUBLIC_SITE_URL</code> masih <code>{env.siteUrl}</code>. QR hanya bisa dibuka dari HP
          bila diisi URL publik (mis. domain Vercel) sebelum dicetak.
        </p>
      )}
      {db.mode === "local" && (
        <p role="note" className="mb-5 rounded-xl border border-tanah-200 bg-white/60 px-4 py-3 text-sm text-ink-soft dark:border-white/10 dark:bg-white/5 dark:text-krem/80">
          Mode Demo: perubahan produk disimpan di <code>.data/store.json</code>. Di Vercel tanpa Supabase, perubahan hilang saat
          server dimulai ulang.
        </p>
      )}
      <ProductDatabase
        products={products}
        categoryLabel={CATEGORY_LABEL}
        siteUrl={env.siteUrl}
        headerActions={
          <>
            <a href="/api/qr/all" download className={secondary}>
              <Archive className="size-4" aria-hidden /> Unduh semua QR
            </a>
            <Link href="/dashboard/products/print" className={secondary}>
              <Printer className="size-4" aria-hidden /> Cetak label
            </Link>
          </>
        }
      />
    </div>
  );
}
