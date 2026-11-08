import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { ProductView } from "@/components/product/ProductView";

export const viewport: Viewport = { themeColor: "#2a190e" };

async function load(kode: string, seri: string) {
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(kode));
  const unit = product ? await db.getUnit(product.code, decodeURIComponent(seri)) : null;
  return { db, product, unit };
}

export async function generateMetadata(props: PageProps<"/p/[kode]/[seri]">): Promise<Metadata> {
  const { kode, seri } = await props.params;
  const { product, unit } = await load(kode, seri);
  if (!product || !unit) return { title: "Unit tidak ditemukan" };
  return {
    title: `${product.name} - Unit ${unit.serial}`,
    description: `Data unit ${unit.serial} ${product.name}: kode produksi, garansi, dan QC.`,
    // Unit pages carry per-unit details (QC inspector, warranty); keep them out of search engines.
    robots: { index: false, follow: false },
  };
}

export default async function UnitPage(props: PageProps<"/p/[kode]/[seri]">) {
  const { kode, seri } = await props.params;
  const { src } = await props.searchParams;
  const { db, product, unit } = await load(kode, seri);
  if (!product || !unit) notFound();
  const faqs = await db.listFaqs(product.code);
  return <ProductView product={product} faqs={faqs} unit={unit} fromQr={src === "qr"} />;
}
