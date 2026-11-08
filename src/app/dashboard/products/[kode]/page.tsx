import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Printer } from "lucide-react";
import { getDb } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { CATEGORY_LABEL } from "@/data/products";
import { UnitManager } from "@/components/catalog/UnitManager";

export async function generateMetadata(props: PageProps<"/dashboard/products/[kode]">): Promise<Metadata> {
  const { kode } = await props.params;
  return { title: `Unit ${decodeURIComponent(kode)}` };
}

const secondary =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-tanah-700 ring-1 ring-tanah-900/15 transition hover:bg-tanah-50 dark:text-krem dark:ring-white/15 dark:hover:bg-white/10";

export default async function ProductUnitsPage(props: PageProps<"/dashboard/products/[kode]">) {
  const { kode } = await props.params;
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(kode));
  if (!product) notFound();
  const units = await db.listUnits(product.code);

  return (
    <div className="w-full">
      <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm text-tanah-600 hover:underline dark:text-emas">
        <ArrowLeft className="size-4" aria-hidden /> Katalog Produk
      </Link>

      <div className="mt-3 mb-8 flex flex-wrap items-center gap-5">
        <div className="relative aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-md border border-kat-line bg-kat-raised">
          <Image src={product.image} alt={product.name} fill sizes="144px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-aksen-text">
            {product.code} - {CATEGORY_LABEL[product.category]}
          </p>
          <h1 className="mt-1 font-display text-3xl text-tanah-700 dark:text-krem">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-krem/70">{formatRupiah(product.price)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/p/${product.code}`} target="_blank" rel="noopener noreferrer" className={secondary}>
            <ExternalLink className="size-4" aria-hidden /> Halaman umum
          </a>
          {units.length > 0 && (
            <Link href={`/dashboard/products/print?kode=${encodeURIComponent(product.code)}`} className={secondary}>
              <Printer className="size-4" aria-hidden /> Cetak label unit
            </Link>
          )}
        </div>
      </div>

      <UnitManager productCode={product.code} units={units} />
    </div>
  );
}
