import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { ProductView } from "@/components/product/ProductView";

export const viewport: Viewport = { themeColor: "#2a190e" };

export async function generateMetadata(props: PageProps<"/p/[kode]">): Promise<Metadata> {
  const { kode } = await props.params;
  const product = await getDb().getProduct(decodeURIComponent(kode));
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.name,
    description: `Spesifikasi, FAQ, dan asisten tanya-jawab ${product.name} dari Astoetik.`,
    // Photos uploaded from the dashboard are data URLs, which cannot be OG images.
    openGraph: product.image.startsWith("/") ? { images: [product.image] } : undefined,
  };
}

export default async function ProductPage(props: PageProps<"/p/[kode]">) {
  const { kode } = await props.params;
  const { src } = await props.searchParams;
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(kode));
  if (!product) notFound();
  const faqs = await db.listFaqs(product.code);
  return <ProductView product={product} faqs={faqs} fromQr={src === "qr"} />;
}
