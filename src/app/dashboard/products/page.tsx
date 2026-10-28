import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Archive, Download, ExternalLink, Printer } from "lucide-react";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { formatRupiah } from "@/lib/format";
import { CATEGORY_LABEL } from "@/data/products";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Produk & QR" };

const btn =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-tanah-900/10 transition hover:bg-tanah-50 dark:ring-white/15 dark:hover:bg-white/10";

export default async function ProductsPage() {
  const products = await getDb().listProducts();
  const localhost = /localhost|127\.0\.0\.1/.test(env.siteUrl);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Produk & QR" subtitle={`${products.length} produk inti. QR mengarah ke ${env.siteUrl}/p/<kode>?src=qr`}>
        <div className="flex flex-wrap gap-2">
          <a href="/api/qr/all" className="inline-flex items-center gap-1.5 rounded-lg bg-tanah-600 px-3 py-2 text-xs font-semibold text-white dark:bg-emas dark:text-tanah-900">
            <Archive className="size-4" aria-hidden /> Unduh semua QR (.zip)
          </a>
          <Link href="/dashboard/products/print" className="inline-flex items-center gap-1.5 rounded-lg bg-emas px-3 py-2 text-xs font-semibold text-tanah-900">
            <Printer className="size-4" aria-hidden /> Cetak label
          </Link>
        </div>
      </PageHeader>

      {localhost && (
        <p role="note" className="mb-5 rounded-xl border border-emas bg-emas-soft/60 px-4 py-3 text-sm text-tanah-900">
          <strong>Perhatian:</strong> <code>NEXT_PUBLIC_SITE_URL</code> masih <code>{env.siteUrl}</code>. QR hanya bisa dibuka dari HP
          bila diisi URL publik (mis. domain Vercel) sebelum dicetak.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <li key={p.code}>
            <Card className="flex h-full gap-4 !p-4">
              <div className="flex w-28 shrink-0 flex-col gap-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-white ring-1 ring-tanah-900/10">
                  {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
                  <img src={`/api/qr/${p.code}`} alt={`QR ${p.code}`} className="size-full" loading="lazy" />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={p.image} alt={p.name} fill sizes="112px" className="object-cover" />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-mono text-xs text-tanah-500 dark:text-emas">{p.code}</p>
                <h2 className="font-medium leading-snug">{p.name}</h2>
                <p className="text-xs text-ink-soft dark:text-krem/60">{CATEGORY_LABEL[p.category]}</p>
                <p className="mt-1 text-sm font-semibold">{formatRupiah(p.price)}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.sni && <span className="rounded bg-tanah-100 px-1.5 py-0.5 text-[10px] font-semibold text-tanah-700">SNI</span>}
                  {p.tkdn && <span className="rounded bg-emas-soft px-1.5 py-0.5 text-[10px] font-semibold text-tanah-800">TKDN {p.tkdn}</span>}
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  <a href={`/api/qr/${p.code}?download=1`} className={btn}>
                    <Download className="size-3.5" aria-hidden /> PNG
                  </a>
                  <Link href={`/p/${p.code}`} target="_blank" className={btn}>
                    <ExternalLink className="size-3.5" aria-hidden /> Halaman
                  </Link>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
