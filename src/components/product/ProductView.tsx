import Link from "next/link";
import { BadgeCheck, ChevronDown, Flag, ShieldAlert } from "lucide-react";
import type { Product, ProductFaq, ProductUnit } from "@/types";
import { formatRupiah, waLink, WA_NUMBER } from "@/lib/format";
import { ProductGallery } from "./ProductGallery";
import { ProductChat } from "./ProductChat";
import { BuyButtons } from "./BuyButtons";
import { PageTracker } from "./PageTracker";
import { UnitCard } from "./UnitCard";

/** Public product page body, shared by /p/[kode] (product type) and /p/[kode]/[seri] (one unit). */
export function ProductView({
  product,
  faqs,
  unit,
  fromQr,
}: {
  product: Product;
  faqs: ProductFaq[];
  unit?: ProductUnit;
  fromQr: boolean;
}) {
  const generatedFaq = faqs.some((f) => f.source === "generated");
  const suggestions = [...faqs.slice(0, 2).map((f) => f.question), "Bagaimana cara merawatnya dengan aman?"];
  const subject = unit ? `${product.name} (${product.code}, unit ${unit.serial})` : `${product.name} (${product.code})`;
  const waHref = waLink(WA_NUMBER, `Halo Astoetik, saya ingin bertanya tentang ${subject}.`);
  const sectionTitle = "font-grotesk text-lg font-semibold text-kat-text";

  return (
    <main className="flex-1 bg-kat-bg text-kat-text">
      <PageTracker productCode={product.code} serial={unit?.serial} fromQr={fromQr} />

      <header className="border-b border-kat-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/" className="font-grotesk text-sm font-semibold text-kat-text">
            CV. Astoetik Indonesia
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-12 pt-5 sm:pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <ProductGallery images={product.gallery} name={product.name} />

          <div>
            <p className="font-mono text-xs text-aksen-text">
              {product.code}
              {unit && <span className="text-kat-muted"> · Unit {unit.serial}</span>}
            </p>
            <h1 className="mt-1.5 font-grotesk text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-3 font-grotesk text-2xl font-semibold tabular-nums">{formatRupiah(product.price)}</p>

            {(product.sni || product.tkdn || product.note) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.sni && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm bg-emas px-2 py-1 text-xs font-semibold text-ink">
                    <BadgeCheck className="size-3.5" aria-hidden /> SNI
                  </span>
                )}
                {product.tkdn && (
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-kat-line px-2 py-1 text-xs font-medium">
                    <Flag className="size-3.5 text-aksen-text" aria-hidden /> TKDN {product.tkdn}
                  </span>
                )}
                {product.note && (
                  <span className="rounded-sm border border-kat-line px-2 py-1 text-xs text-kat-muted">{product.note}</span>
                )}
              </div>
            )}

            {unit && (
              <div className="mt-6">
                <UnitCard unit={unit} />
                <Link
                  href={`/p/${product.code}`}
                  className="mt-2 inline-block text-xs text-kat-muted underline-offset-4 hover:text-kat-text hover:underline"
                >
                  Lihat halaman umum {product.code}
                </Link>
              </div>
            )}

            <section aria-labelledby="spec-title" className="mt-8">
              <h2 id="spec-title" className={sectionTitle}>
                Spesifikasi
              </h2>
              {product.specs.length > 0 ? (
                <dl className="mt-3 overflow-hidden rounded-md border border-kat-line text-sm">
                  {product.specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-[2fr_3fr] border-b border-kat-line last:border-0 odd:bg-kat-raised/60">
                      <dt className="px-4 py-2.5 text-kat-muted">{s.label}</dt>
                      <dd className="px-4 py-2.5 font-medium">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-kat-muted">Spesifikasi belum tersedia. Tanyakan langsung ke CS kami.</p>
              )}
            </section>

            <div className="mt-6">
              <BuyButtons productCode={product.code} links={product.marketplaceLinks} waHref={waHref} />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-kat-line pt-10 lg:grid-cols-2 lg:gap-12">
          <section aria-labelledby="faq-title">
            <div className="flex items-center justify-between gap-3">
              <h2 id="faq-title" className={sectionTitle}>
                Pertanyaan umum
              </h2>
              {generatedFaq && (
                <span className="rounded-sm bg-kat-raised px-2 py-0.5 text-[11px] text-kat-muted">FAQ umum</span>
              )}
            </div>
            {faqs.length > 0 ? (
              <div className="mt-3 divide-y divide-kat-line rounded-md border border-kat-line">
                {faqs.map((f) => (
                  <details key={f.id} className="group">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <ChevronDown
                        className="mt-0.5 size-4 shrink-0 text-kat-muted transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="px-4 pb-4 text-sm leading-relaxed text-kat-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-kat-muted">Belum ada FAQ untuk produk ini. Silakan tanya asisten atau CS.</p>
            )}
            {generatedFaq && (
              <p className="mt-2 text-xs text-kat-muted">FAQ umum disusun dari data spesifikasi. Untuk detail teknis lain, tanyakan ke CS.</p>
            )}
          </section>

          <ProductChat productCode={product.code} productName={product.name} suggestions={suggestions} />
        </div>

        <p className="mt-10 flex items-start gap-2.5 rounded-md border border-emas/50 bg-emas-soft/40 px-4 py-3 text-xs leading-relaxed text-tanah-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          Alat ini menggunakan listrik dan menghasilkan panas. Gunakan di permukaan datar dan kering, jauhkan dari jangkauan anak-anak,
          dan cabut steker setelah selesai.
        </p>
      </div>

      <footer className="border-t border-kat-line py-6 text-center text-xs text-kat-muted">
        © CV. Astoetik Indonesia · Bantul, DIY
      </footer>
    </main>
  );
}
