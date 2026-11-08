import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaCircleQuestion, FaFlag, FaListCheck, FaShieldHalved, FaTriangleExclamation } from "react-icons/fa6";
import type { Product, ProductFaq, ProductUnit } from "@/types";
import { formatRupiah, waLink, WA_NUMBER } from "@/lib/format";
import { ProductGallery } from "./ProductGallery";
import { ProductChat } from "./ProductChat";
import { BuyButtons } from "./BuyButtons";
import { PageTracker } from "./PageTracker";
import { UnitCard } from "./UnitCard";

/** Section heading with a small icon tile, shared by the cards below the hero. */
function CardTitle({ id, icon, children, aside }: { id: string; icon: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-tanah-900 text-hm-gold shadow-sm">{icon}</span>
        <h2 id={id} className="font-display text-xl font-semibold text-ink">
          {children}
        </h2>
      </div>
      {aside}
    </div>
  );
}

const card = "glossy rounded-3xl border border-tanah-900/[0.07] bg-white p-5 sm:p-6";

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
  const suggestions = [...faqs.slice(0, 2).map((f) => f.question), "Bagaimana cara merawatnya dengan aman?"];
  const subject = unit ? `${product.name} (${product.code}, unit ${unit.serial})` : `${product.name} (${product.code})`;
  const waHref = waLink(WA_NUMBER, `Halo Astoetik, saya ingin bertanya tentang ${subject}.`);

  return (
    <main className="flex-1 bg-krem text-ink">
      <PageTracker productCode={product.code} serial={unit?.serial} fromQr={fromQr} />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-tanah-900/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-3 text-krem">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-emas-soft">
              <Image src="/home/logo-astoetik.png" alt="" width={28} height={28} className="size-7 object-contain" />
            </span>
            <span className="font-display text-base font-semibold tracking-wide">CV. Astoetik Indonesia</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-tanah-900 via-tanah-800 to-tanah-600 text-krem">
        <Image src="/home/batik-coklat.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-[0.14] mix-blend-soft-light" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[radial-gradient(closest-side,rgba(240,207,138,0.35),transparent)]"
        />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:pb-28">
          <ProductGallery images={product.gallery} name={product.name} />

          <div className="flex flex-col justify-center">
            {(product.sni || product.tkdn || product.note) && (
              <div className="flex flex-wrap gap-2">
                {product.sni && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-hm-gold px-3 py-1 text-xs font-semibold text-tanah-900">
                    <FaShieldHalved className="size-3" aria-hidden /> SNI
                  </span>
                )}
                {product.tkdn && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                    <FaFlag className="size-3 text-hm-gold" aria-hidden /> TKDN {product.tkdn}
                  </span>
                )}
                {product.note && <span className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/25">{product.note}</span>}
              </div>
            )}
            <h1 className="mt-4 text-balance font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">{product.name}</h1>
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums text-hm-gold sm:text-4xl">{formatRupiah(product.price)}</p>
            <div className="mt-6">
              <BuyButtons productCode={product.code} links={product.marketplaceLinks} waHref={waHref} />
            </div>
          </div>
        </div>
      </section>

      {/* Content cards overlap the hero */}
      <div className="relative z-10 mx-auto -mt-14 max-w-6xl space-y-6 px-4 pb-12 lg:-mt-16">
        {unit && (
          <div>
            <UnitCard unit={unit} />
            <Link
              href={`/p/${product.code}`}
              className="mt-3 inline-block text-xs font-medium text-tanah-600 underline-offset-4 hover:underline"
            >
              Lihat halaman umum produk
            </Link>
          </div>
        )}

        <section aria-labelledby="spec-title" className={card}>
          <CardTitle id="spec-title" icon={<FaListCheck className="size-4" aria-hidden />}>
            Spesifikasi
          </CardTitle>
          {product.specs.length > 0 ? (
            <dl className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4 rounded-2xl bg-tanah-50 px-4 py-3 text-sm">
                  <dt className="text-ink-soft">{s.label}</dt>
                  <dd className="text-right font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Spesifikasi belum tersedia. Tanyakan langsung ke CS kami.</p>
          )}
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section aria-labelledby="faq-title" className={card}>
            <CardTitle
              id="faq-title"
              icon={<FaCircleQuestion className="size-4" aria-hidden />}
            >
              Pertanyaan umum
            </CardTitle>
            {faqs.length > 0 ? (
              <div className="mt-5 space-y-2">
                {faqs.map((f) => (
                  <details key={f.id} className="group rounded-2xl bg-tanah-50 transition-colors open:bg-emas-soft/50">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3.5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white text-tanah-600 shadow-sm">
                        <FaChevronDown className="size-2.5 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                      </span>
                    </summary>
                    <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-ink-soft">{f.answer}</p>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">Belum ada FAQ untuk produk ini. Silakan tanya asisten atau CS.</p>
            )}
          </section>

          <ProductChat productCode={product.code} productName={product.name} suggestions={suggestions} />
        </div>

        <p className="flex items-start gap-3 rounded-3xl border border-emas/50 bg-emas-soft/60 px-5 py-4 text-sm leading-relaxed text-tanah-800">
          <FaTriangleExclamation className="mt-0.5 size-4 shrink-0 text-emas" aria-hidden />
          Alat ini menggunakan listrik dan menghasilkan panas. Gunakan di permukaan datar dan kering, jauhkan dari jangkauan anak-anak, dan
          cabut steker setelah selesai.
        </p>
      </div>

      <footer className="bg-tanah-900 py-6 text-center text-xs text-krem/70">© CV. Astoetik Indonesia, Bantul, DIY</footer>
    </main>
  );
}
