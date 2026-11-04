import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db";
import { productQrUrl, qrSvg } from "@/lib/qr";
import { PrintButton } from "@/components/dashboard/PrintButton";

export const metadata: Metadata = { title: "Cetak Label QR" };

interface Label {
  key: string;
  code: string;
  name: string;
  serial: string | null;
  svg: string;
  url: string;
}

/** Without ?kode: one label per product type. With ?kode=<code>: one label per unit of that product. */
export default async function PrintLabelsPage(props: PageProps<"/dashboard/products/print">) {
  const { kode } = await props.searchParams;
  const db = getDb();
  let labels: Label[];
  let back = "/dashboard/products";
  let scope = "Satu label per jenis produk.";

  if (typeof kode === "string") {
    const product = await db.getProduct(kode);
    if (!product) notFound();
    const units = await db.listUnits(product.code);
    back = `/dashboard/products/${product.code}`;
    scope = `${units.length} label unit ${product.code}.`;
    labels = await Promise.all(
      units.map(async (u) => ({
        key: u.serial,
        code: product.code,
        name: product.name,
        serial: u.serial,
        svg: await qrSvg(product.code, u.serial),
        url: productQrUrl(product.code, u.serial),
      })),
    );
  } else {
    const products = await db.listProducts();
    labels = await Promise.all(
      products.map(async (p) => ({
        key: p.code,
        code: p.code,
        name: p.name,
        serial: null,
        svg: await qrSvg(p.code),
        url: productQrUrl(p.code),
      })),
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={back} className="inline-flex items-center gap-1 text-sm text-tanah-600 hover:underline dark:text-emas">
            <ArrowLeft className="size-4" aria-hidden /> Kembali
          </Link>
          <h1 className="mt-1 font-display text-3xl text-tanah-700 dark:text-krem">Cetak Label QR</h1>
          <p className="text-sm text-ink-soft dark:text-krem/70">
            {scope} Ukuran label 6 × 8 cm. Atur printer ke A4, skala 100%.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2">
        {labels.map((l) => (
          <article
            key={l.key}
            className="flex break-inside-avoid flex-col items-center rounded-xl border-2 border-dashed border-tanah-300 bg-white p-3 text-center text-ink print:h-[8cm] print:w-[6cm] print:rounded-none print:border"
          >
            <p className="font-display text-xs tracking-[0.2em] text-tanah-600">ASTOETIK</p>
            <div
              className="my-1.5 w-32 print:w-[4.2cm] [&>svg]:h-auto [&>svg]:w-full"
              role="img"
              aria-label={`QR ${l.code}${l.serial ? ` unit ${l.serial}` : ""}`}
              dangerouslySetInnerHTML={{ __html: l.svg }}
            />
            <p className="font-mono text-sm font-bold">
              {l.code}
              {l.serial && <span className="font-normal"> / {l.serial}</span>}
            </p>
            <p className="line-clamp-2 text-[11px] leading-tight">{l.name}</p>
            <p className="mt-1 text-[9px] text-ink-soft">
              {l.serial ? "Scan untuk data unit, garansi & tanya jawab" : "Scan untuk spesifikasi & tanya jawab"}
            </p>
            <p className="sr-only">{l.url}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
