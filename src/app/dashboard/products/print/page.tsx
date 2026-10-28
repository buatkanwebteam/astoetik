import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db";
import { productQrUrl, qrSvg } from "@/lib/qr";
import { PrintButton } from "@/components/dashboard/PrintButton";

export const metadata: Metadata = { title: "Cetak Label QR" };

export default async function PrintLabelsPage() {
  const products = await getDb().listProducts();
  const labels = await Promise.all(products.map(async (p) => ({ p, svg: await qrSvg(p.code), url: productQrUrl(p.code) })));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm text-tanah-600 hover:underline dark:text-emas">
            <ArrowLeft className="size-4" aria-hidden /> Kembali
          </Link>
          <h1 className="mt-1 font-display text-3xl text-tanah-700 dark:text-krem">Cetak Label QR</h1>
          <p className="text-sm text-ink-soft dark:text-krem/70">Ukuran label 6 × 8 cm. Atur printer ke A4, skala 100%.</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2">
        {labels.map(({ p, svg, url }) => (
          <article
            key={p.code}
            className="flex break-inside-avoid flex-col items-center rounded-xl border-2 border-dashed border-tanah-300 bg-white p-3 text-center text-ink print:h-[8cm] print:w-[6cm] print:rounded-none print:border"
          >
            <p className="font-display text-xs tracking-[0.2em] text-tanah-600">ASTOETIK</p>
            <div className="my-1.5 w-32 print:w-[4.2cm] [&>svg]:h-auto [&>svg]:w-full" role="img" aria-label={`QR ${p.code}`} dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="font-mono text-sm font-bold">{p.code}</p>
            <p className="line-clamp-2 text-[11px] leading-tight">{p.name}</p>
            <p className="mt-1 text-[9px] text-ink-soft">Scan untuk spesifikasi & tanya jawab</p>
            <p className="sr-only">{url}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
