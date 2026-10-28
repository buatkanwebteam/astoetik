import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronDown, Flag, ShieldAlert } from "lucide-react";
import { getDb } from "@/lib/db";
import { isGeminiEnabled } from "@/lib/env";
import { formatRupiah, waLink, WA_NUMBER } from "@/lib/format";
import { CATEGORY_LABEL } from "@/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductChat } from "@/components/product/ProductChat";
import { BuyButtons } from "@/components/product/BuyButtons";
import { PageTracker } from "@/components/product/PageTracker";

export async function generateMetadata(props: PageProps<"/p/[kode]">): Promise<Metadata> {
  const { kode } = await props.params;
  const product = await getDb().getProduct(decodeURIComponent(kode));
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: `${product.name} (${product.code})`,
    description: `Spesifikasi, FAQ, dan asisten tanya-jawab ${product.name} dari Astoetik.`,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductPage(props: PageProps<"/p/[kode]">) {
  const { kode } = await props.params;
  const { src } = await props.searchParams;
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(kode));
  if (!product) notFound();
  const faqs = await db.listFaqs(product.code);
  const generatedFaq = faqs.some((f) => f.source === "generated");

  const suggestions = [...faqs.slice(0, 2).map((f) => f.question), "Bagaimana cara merawatnya dengan aman?"];
  const waHref = waLink(WA_NUMBER, `Halo Astoetik, saya ingin bertanya tentang ${product.name} (${product.code}).`);

  return (
    <main className="mx-auto w-full max-w-md flex-1 pb-12">
      <PageTracker productCode={product.code} fromQr={src === "qr"} />

      {/* Hero */}
      <section className="batik-pattern relative px-4 pb-6 pt-5 text-krem">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="font-display text-lg tracking-wide">
            ASTOETIK
          </Link>
          <span className="rounded-full bg-black/25 px-2.5 py-1 text-[11px] uppercase tracking-wider">
            {CATEGORY_LABEL[product.category]}
          </span>
        </div>
        <ProductGallery images={product.gallery} name={product.name} />
        <p className="mt-4 font-mono text-xs tracking-widest text-emas">{product.code}</p>
        <h1 className="mt-1 font-display text-[1.75rem] leading-tight">{product.name}</h1>
        <p className="mt-2 text-xl font-semibold">{formatRupiah(product.price)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sni && (
            <span className="inline-flex items-center gap-1 rounded-full bg-krem px-2.5 py-1 text-xs font-semibold text-tanah-700">
              <BadgeCheck className="size-3.5" aria-hidden /> SNI
            </span>
          )}
          {product.tkdn && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emas px-2.5 py-1 text-xs font-semibold text-tanah-900">
              <Flag className="size-3.5" aria-hidden /> TKDN {product.tkdn}
            </span>
          )}
          {product.note && (
            <span className="rounded-full border border-krem/40 px-2.5 py-1 text-xs">{product.note}</span>
          )}
        </div>
      </section>

      <div className="space-y-6 px-4 pt-6">
        {/* Specs */}
        <section aria-labelledby="spec-title">
          <h2 id="spec-title" className="mb-3 font-display text-xl text-tanah-700">
            Spesifikasi
          </h2>
          <table className="w-full overflow-hidden rounded-2xl bg-white text-sm shadow-sm ring-1 ring-tanah-900/10">
            <tbody>
              {product.specs.map((s) => (
                <tr key={s.label} className="border-b border-tanah-900/5 last:border-0">
                  <th scope="row" className="w-2/5 px-4 py-2.5 text-left font-medium text-ink-soft">
                    {s.label}
                  </th>
                  <td className="px-4 py-2.5 text-ink">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="faq-title" className="font-display text-xl text-tanah-700">
              Pertanyaan Umum
            </h2>
            {generatedFaq && (
              <span className="rounded-full bg-tanah-100 px-2 py-0.5 text-[11px] font-medium text-tanah-700">FAQ umum</span>
            )}
          </div>
          <div className="divide-y divide-tanah-900/5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-tanah-900/10">
            {faqs.map((f) => (
              <details key={f.id} className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown className="mt-0.5 size-4 shrink-0 text-tanah-400 transition group-open:rotate-180" aria-hidden />
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-ink-soft">{f.answer}</p>
              </details>
            ))}
          </div>
          {generatedFaq && (
            <p className="mt-2 text-xs text-ink-soft">
              FAQ umum disusun dari data spesifikasi. Untuk detail teknis lain, tanyakan ke CS.
            </p>
          )}
        </section>

        <ProductChat
          productCode={product.code}
          productName={product.name}
          suggestions={suggestions}
          demo={!isGeminiEnabled}
        />

        <BuyButtons productCode={product.code} links={product.marketplaceLinks} waHref={waHref} />

        <p className="flex items-start gap-2 rounded-xl bg-emas-soft/60 px-3 py-2.5 text-xs leading-relaxed text-tanah-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          Alat ini menggunakan listrik dan menghasilkan panas. Gunakan di permukaan datar dan kering, jauhkan dari jangkauan
          anak-anak, dan cabut steker setelah selesai.
        </p>
      </div>

      <footer className="mt-10 px-4 text-center text-xs text-ink-soft">
        © CV. Astoetik Indonesia · Bantul, DIY
      </footer>
    </main>
  );
}
