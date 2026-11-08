import Image from "next/image";
import { AnimatedCounter, WordReveal } from "./motion";
import { GlassLink } from "./GlassLink";
import { ProductCollection } from "./ProductCollection";
import { OrgModal } from "./OrgModal";
import { Faq } from "./Faq";
import { FABRIC_TEXTURE, InnerBorder, KawungRing, MegaWave, ParangCorner } from "./ornaments";
import { formatRupiah, waLink, WA_NUMBER } from "@/lib/format";
import type { Product } from "@/types";
import { FaArrowRight, FaArrowRightLong, FaBookOpen, FaCheck, FaGraduationCap, FaLifeRing, FaLocationDot, FaMagnifyingGlass, FaPhone, FaRobot, FaWhatsapp } from "react-icons/fa6";

const TAGS_A = ["Kompor listrik", "Canting listrik", "Kompor cap", "Pewarna alami", "Kain mori"];

const wrapW = "w-full px-4 md:px-6";
const h2 = "font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-[#141414] md:text-5xl";

function Marquee({ items, rev, render }: { items: string[]; rev?: boolean; render: (s: string, i: number) => React.ReactNode }) {
  const loop = [...items, ...items];
  return (
    <div className="hm-marquee-wrap overflow-hidden" aria-hidden>
      <div className={`hm-marquee gap-3 ${rev ? "hm-marquee-rev" : ""}`}>{loop.map((s, i) => render(s, i))}</div>
    </div>
  );
}

/** Panel "Tentang" kompak: dipasang di atas animasi timeline dalam satu layar. */
export function AboutPanel({ products }: { products: Product[] }) {
  const first = products[0];
  return (
    <div className="grid w-full gap-6 px-4 pt-[clamp(2.5rem,8vh,5rem)] md:px-6 lg:grid-cols-[1.15fr_1.4fr] lg:gap-8">
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.25em] text-hm-mid">Tentang ASTOETIK</p>
        <WordReveal
          text="Dibangun untuk masa depan batik Indonesia"
          className="mt-2 font-display text-[clamp(1.9rem,4.6vh+1rem,3.6rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[#141414]"
        />
        <p className="mt-3 max-w-xl text-[clamp(0.85rem,1.6vh+0.2rem,1.05rem)] leading-snug text-hm-muted">
          <strong className="font-semibold text-[#141414]">Teknologi bertemu warisan budaya.</strong> ASTOETIK berfokus pada inovasi peralatan batik
          listrik, peralatan pendukung, dan ekosistem membatik, dari produk fisik menuju panduan, bantuan, dan layanan digital.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <GlassLink href="#produk" variant="filled" tint="#3e2414">
            Jelajahi produk
          </GlassLink>
        </div>
        <div className="mt-3">
          <OrgModal />
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2">
        {/* Kartu 1: Product Passport */}
        <div className="relative h-[clamp(240px,32vh,280px)] overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-br from-[#4a3220] via-[#3d2a1c] to-[#2b1d13] p-5 text-white shadow-[0_18px_40px_-14px_rgba(43,29,19,.65),inset_0_1px_0_rgba(255,255,255,.12)]">
          <div className="pointer-events-none absolute inset-0 opacity-[.07] mix-blend-screen" style={FABRIC_TEXTURE} aria-hidden />
          <ParangCorner className="-right-2 -top-2 size-36 opacity-30" />
          <InnerBorder />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium leading-tight tracking-tight text-[#f6e7c5]">Satu scan, identitas produk dan dukungan</h3>
              <ul className="mt-3 space-y-2 text-xs text-white/75">
                {["Produk dikenali dari kode model atau serial unit.", "Panduan dan troubleshooting sesuai model."].map((t) => (
                  <li key={t} className="flex gap-2">
                    <FaCheck className="mt-0.5 size-3.5 shrink-0 text-[#d4af37]" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <GlassLink href={first ? `/p/${first.code}` : "#produk"} variant="filled" tint="#8c5a2f">
                Lihat Product Passport
              </GlassLink>
            </div>
          </div>
        </div>

        {/* Kartu 2: Tanya ASKA */}
        <div className="relative h-[clamp(240px,32vh,280px)] overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-b from-[#3d2a1c] via-[#31221a] to-[#261a11] p-5 text-white shadow-[0_18px_40px_-14px_rgba(38,26,17,.7),inset_0_1px_0_rgba(255,255,255,.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(212,175,55,.14),transparent_60%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 opacity-[.07] mix-blend-screen" style={FABRIC_TEXTURE} aria-hidden />
          <MegaWave className="-bottom-2 -left-2 h-32 w-48 opacity-35" />
          <InnerBorder />

          <div className="relative size-full">
            <div className="absolute right-0 top-0 size-14">
              <KawungRing className="inset-0 size-full" />
              <span className="absolute inset-[9px] grid place-items-center rounded-full border border-[#d4af37]/60 bg-[#25170c] text-[#f0cf8a] shadow-lg">
                <FaRobot className="size-5" aria-hidden />
              </span>
            </div>
            <div className="absolute left-0 top-0 w-40 rounded-2xl bg-white/10 p-3 ring-1 ring-[#d4af37]/25 backdrop-blur">
              <p className="rounded-lg bg-white/10 px-2 py-1.5 text-[11px]">Suhu tidak stabil, apa yang harus saya lakukan?</p>
              <p className="mt-1.5 rounded-lg bg-hm-gold px-2 py-1.5 text-[11px] text-hm-deep">Cek dulu kabel dan stop kontak…</p>
            </div>
            <div className="absolute inset-x-0 bottom-0">
              <p className="text-[15px] leading-tight tracking-tight xl:text-lg">Tanya ASKA, Asisten yang paham</p>
              <span className="mt-1 inline-block rounded-md bg-hm-gold px-2 py-0.5 text-[15px] leading-tight tracking-tight text-black xl:text-lg">Produk yang anda pakai</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Kartu kaca (glossy) dengan gelembung bulat mengilap di dalamnya. */
function GlossCard({ children, className = "", inner = "p-8", back, bubbles = "a" }: { children: React.ReactNode; className?: string; inner?: string; back?: React.ReactNode; bubbles?: "a" | "b" | "c" }) {
  const layout = {
    a: ["-right-8 -top-8 size-36", "right-10 top-24 size-10", "-bottom-10 left-6 size-28"],
    b: ["-left-10 top-6 size-32", "right-6 bottom-28 size-12", "-bottom-12 -right-6 size-36"],
    c: ["right-4 -top-10 size-32", "left-8 top-1/3 size-9", "-bottom-8 -left-8 size-32"],
  }[bubbles];
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/25 via-white/10 to-white/[.04] shadow-[0_24px_50px_-20px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.45),inset_0_-1px_0_rgba(255,255,255,.08)] ring-1 ring-white/25 md:backdrop-blur-md ${className}`}
    >
      {back}
      {layout.map((pos, i) => (
        <span
          key={i}
          aria-hidden
          className={`pointer-events-none absolute rounded-full border border-white/30 bg-transparent shadow-[inset_6px_8px_14px_-8px_rgba(255,255,255,.55),inset_-6px_-8px_14px_-8px_rgba(240,207,138,.4)] ${pos}`}
        />
      ))}
      <div className={`relative flex h-full flex-col ${inner}`}>{children}</div>
    </div>
  );
}

const NEEDS = [
  { t: "Saya mencari alat batik", d: "Temukan produk", href: "#produk", Icon: FaMagnifyingGlass },
  { t: "Saya ingin belajar membatik", d: "Lihat event & partner", href: "#event", Icon: FaGraduationCap },
  { t: "Produk saya bermasalah", d: "Tanya ASKA", href: "#aska", Icon: FaLifeRing },
  { t: "Saya ingin mengenal produk", d: "Buka panduan", href: "#panduan", Icon: FaBookOpen },
];
const cardTitle = "font-display text-xl font-medium tracking-tight md:text-2xl";

export function Needs({ products }: { products: Product[] }) {
  const kompor = products.filter((p) => p.category !== "canting").length;
  const canting = products.length - kompor;
  const cover = products.find((p) => p.category === "canting") ?? products[0];
  const total = products.length || 1;
  const minPrice = products.length ? Math.min(...products.map((p) => p.price)) : 0;
  const thumbs = [products[0], products[3], products[9], products[products.length - 1]].filter(Boolean) as Product[];
  const segs = [
    { l: "Kompor", n: kompor, c: "bg-hm-gold" },
    { l: "Canting", n: canting, c: "bg-white/80" },
  ];
  return (
    <section id="kebutuhan" className="flex min-h-[calc(100vh+33px)] w-full flex-col bg-[#261a11] bg-[url(/home/batik-coklat.jpg)] bg-cover bg-center pb-8 pt-[clamp(2.5rem,8vh,5rem)] text-white md:pb-12">
      <WordReveal
        text="Mulai dari kebutuhan Anda"
        className="px-4 text-center font-display text-3xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-4xl md:text-6xl"
      />
      <div className={`${wrapW} my-auto pt-6 md:pt-10`}>
        <div className="grid gap-3 md:grid-cols-3 md:gap-6">
          <GlossCard bubbles="a" inner="p-4 md:p-6" className="md:min-h-[440px]">
            <h3 className={cardTitle}>Apa yang Anda cari?</h3>
            <ul className="mt-3 space-y-2 md:mt-5 md:space-y-2.5">
              {NEEDS.map(({ t, d, href, Icon }) => (
                <li key={t}>
                  <a href={href} className="group flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/20 transition hover:bg-white/20 md:px-4 md:py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-hm-gold/90 text-hm-deep md:size-9">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-tight">{t}</span>
                      <span className="block text-xs text-white/65">{d}</span>
                    </span>
                    <FaArrowRight className="size-4 shrink-0 text-white/60 transition group-hover:translate-x-0.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-3 md:pt-5">
              <Marquee
                items={TAGS_A}
                render={(s, i) => (
                  <a
                    key={i}
                    href="#produk"
                    tabIndex={-1}
                    className="cursor-pointer whitespace-nowrap rounded-full border border-white/25 px-3 py-1.5 text-xs transition-colors duration-200 hover:border-hm-gold hover:bg-hm-gold hover:text-black"
                  >
                    {s}
                  </a>
                )}
              />
            </div>
          </GlossCard>

          <GlossCard bubbles="b" inner="p-4 md:p-8" className="md:min-h-[440px]">
            <h3 className={cardTitle}>Produk Kami</h3>
            <p className="mt-2 text-sm leading-snug text-white/80 md:mt-3 md:text-base">
              Kompor dan canting batik listrik buatan Astoetik, lengkap dengan spesifikasi dan harga. Mulai dari {formatRupiah(minPrice)}.
            </p>
            <div className="mt-3 flex -space-x-3 md:mt-5">
              {thumbs.map((p) => (
                <span key={p.code} className="relative size-11 overflow-hidden rounded-full bg-white ring-2 ring-white/60 md:size-14">
                  <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 md:mt-auto md:p-5">
              <p className="text-sm text-white/70">Pilihan produk</p>
              <p className="mt-1 text-3xl font-medium tracking-tight md:text-4xl">
                <AnimatedCounter to={products.length} />
                <span className="ml-2 text-sm font-normal text-white/70">model</span>
              </p>
              <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full md:mt-4 md:h-3">
                {segs.map((s) => (
                  <div key={s.l} className={`${s.c} rounded-full`} style={{ width: `${(s.n / total) * 100}%` }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/75 md:mt-3">
                {segs.map((s) => (
                  <span key={s.l} className="flex items-center gap-1.5">
                    <i className={`size-2 rounded-full ${s.c}`} />
                    {s.l} {s.n} model
                  </span>
                ))}
              </div>
            </div>
          </GlossCard>

          <GlossCard
            bubbles="c"
            inner="p-4 md:p-8"
            className="min-h-[170px] md:min-h-[440px]"
            back={
              <>
                {cover && <Image src={cover.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-40 mix-blend-luminosity" />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#261a11] via-[#261a11]/50 to-transparent" />
              </>
            }
          >
            <h3 className={cardTitle}>Bantuan setelah membeli</h3>
            <p className="mt-auto pt-6 text-sm leading-snug text-white/90 md:pt-0 md:text-base">
              Ada kendala dengan produk Anda? Tanya ASKA. Kalau belum terjawab, tim Astoetik siap membantu langsung.
            </p>
          </GlossCard>
        </div>
      </div>
    </section>
  );
}

export function ProductShelf({ products }: { products: Product[] }) {
  return (
    <section
      id="produk"
      className="flex h-[calc(100vh+33px)] min-h-[600px] w-full flex-col overflow-hidden bg-hm-sand/50 bg-[url(/home/batik-krem.jpg)] bg-cover bg-center pb-6 pt-[clamp(1.5rem,5vh,3.5rem)]"
    >
      <div className={`${wrapW} flex min-h-0 flex-1 flex-col`}>
        <WordReveal text="Produk dan teknologi untuk membatik" className={`${h2} mb-3 text-center !text-[clamp(1.5rem,4.5vh,3rem)] md:mb-5`} />
        <ProductCollection products={products} />
      </div>
    </section>
  );
}

const EVENTS = [
  {
    kicker: "Program tahunan",
    t: "Batik Merdeka",
    d: "Program tahunan Astoetik bersama komunitas.",
    note: "Informasi jadwal dan pendaftaran segera hadir.",
    bg: "from-[#e08a2e] via-[#c9573a] to-[#a03a46]",
  },
  {
    kicker: "Dokumentasi",
    t: "Event Recap",
    d: "Dokumentasi kegiatan, pameran, dan kolaborasi.",
    note: "Foto dan cerita kegiatan segera hadir.",
    bg: "from-[#7a5233] via-[#573823] to-[#33200f]",
  },
  {
    kicker: "Artikel",
    t: "Blog & Majalah",
    d: "Artikel, tips, dan majalah digital seputar batik.",
    note: "Tulisan dan majalah digital segera hadir.",
    bg: "from-[#d6a642] via-[#b9843a] to-[#8c5a2f]",
  },
];

export function EventsCta() {
  return (
    <section id="event" className="flex min-h-screen w-full items-center bg-gradient-to-b from-white to-hm-gold/40 py-20">
      <div className={wrapW}>
        <div className="mb-10 flex items-end justify-between">
          <h2 className={h2}>Event & Partner</h2>
          <span className="text-sm text-hm-muted">Konten segera hadir</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {EVENTS.map((e) => (
            <div
              key={e.t}
              className={`relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${e.bg} p-7 text-white shadow-[0_16px_40px_-18px_rgba(62,36,20,.45)]`}
            >
              <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-white/15" />
              <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-64 rounded-[50%] bg-white/10" />
              <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">{e.kicker}</p>
              <h3 className="relative mt-4 font-display text-4xl font-semibold tracking-tight">{e.t}</h3>
              <p className="relative mt-2 max-w-[16rem] text-sm leading-snug text-white/90">{e.d}</p>
              <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
                <p className="max-w-[12rem] text-xs leading-snug text-white/70">{e.note}</p>
                <FaArrowRightLong className="size-7 shrink-0 text-white/90" aria-hidden />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-24 max-w-2xl text-center">
          <WordReveal text="Bicara dengan tim Astoetik" className={`${h2} text-5xl`} />
          <p className="mt-6 text-hm-muted">Butuh sewa peralatan, jasa, atau bantuan memilih produk? Konsultasi langsung via WhatsApp.</p>
          <div className="mt-8 flex justify-center">
            <GlassLink href={waLink(WA_NUMBER, "Halo Astoetik, saya ingin berkonsultasi.")} variant="filled" tint="#3e2414">
              Hubungi via WhatsApp
            </GlassLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-hm-dark text-white">
      <div className="w-full px-4 py-8 md:px-6 md:py-10">
        <Faq />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_2fr] md:gap-12">
          <div>
            <p className="font-display text-2xl font-semibold tracking-[0.14em]">ASTOETIK</p>
            <p className="mt-2 max-w-sm text-sm text-white/70">
              Astoetik memperluas pengalaman dari produk fisik menuju panduan, bantuan, layanan, dan wawasan digital yang terhubung.
            </p>
            <a href="#tentang" className="mt-3 inline-block text-sm underline underline-offset-4">
              Tentang kami
            </a>
            <div className="mt-4 flex gap-3">
              <a href={waLink(WA_NUMBER, "Halo Astoetik")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-full bg-white text-hm-dark">
                <FaWhatsapp className="size-4" />
              </a>
            </div>
          </div>
          <div className="grid gap-6 text-sm sm:grid-cols-2">
            <nav aria-label="Footer" className="space-y-1.5 text-white/80">
              {[["#tentang", "Tentang"], ["#produk", "Produk"], ["#panduan", "Smart Guide"], ["#aska", "ASKA-AI"], ["#event", "Event & Partner"]].map(([h, l]) => (
                <a key={h} href={h} className="block hover:text-white">
                  {l}
                </a>
              ))}
            </nav>
            <div className="space-y-2 text-white/80">
              <p className="flex items-center gap-2">
                <FaPhone className="size-4" aria-hidden /> +{WA_NUMBER}
              </p>
              <p className="flex items-start gap-2">
                <FaLocationDot className="mt-0.5 size-4 shrink-0" aria-hidden /> Jeblog, Tirtonirmolo, Kasihan, Bantul, DIY
              </p>
            </div>
          </div>
        </div>
        <p className="mt-6 border-t border-white/15 pt-4 text-xs text-white/50">
          © CV. Astoetik Indonesia
        </p>
      </div>
    </footer>
  );
}
