"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaWhatsapp } from "react-icons/fa6";
import { formatRupiah, waLink, WA_NUMBER } from "@/lib/format";
import type { Product, ProductCategory } from "@/types";

const TABS: { key: "all" | ProductCategory; label: string }[] = [
  { key: "all", label: "Semua Produk" },
  { key: "kompor", label: "Kompor" },
  { key: "kompor-cap", label: "Kompor Cap" },
  { key: "canting", label: "Canting" },
];

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  kompor: "Kompor",
  "kompor-cap": "Kompor Cap",
  canting: "Canting",
};

/** Kartu kaca (glossy) di atas latar krem. */
function Card({ p }: { p: Product }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-white/80 to-white/60 p-2 shadow md:p-3-[0_1px_2px_rgba(62,36,20,.05),0_8px_24px_-8px_rgba(62,36,20,.14),0_24px_48px_-24px_rgba(62,36,20,.16),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-white/90 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(62,36,20,.06),0_14px_32px_-10px_rgba(62,36,20,.18),0_32px_56px_-26px_rgba(62,36,20,.2),inset_0_1px_0_rgba(255,255,255,1)]">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/50 to-transparent" />

      <Link href={`/p/${p.code}`} aria-label={p.name} className="relative block aspect-[5/4] min-h-0 overflow-hidden rounded-2xl bg-white/70 md:aspect-auto md:flex-1">
        <Image src={p.image} alt={p.name} fill sizes="(max-width: 1024px) 70vw, 25vw" className="scale-[1.03] object-cover transition duration-500 group-hover:scale-[1.08]" />
      </Link>

      <div className="relative px-1 pb-1 pt-2 md:pt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#141414] md:text-[15px]">{p.name}</h3>
        <p className="mt-0.5 text-xs text-hm-muted">
          {CATEGORY_LABEL[p.category]} <span className="mx-1 text-hm-gold">•</span>
          <span className="font-mono">{p.code}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 md:mt-3">
          <p className="text-sm font-semibold text-hm-dark md:text-base">{formatRupiah(p.price)}</p>
          <div className="flex items-center gap-1.5">
            <a
              href={waLink(WA_NUMBER, `Halo Astoetik, saya ingin bertanya tentang ${p.name} (${p.code}).`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat WhatsApp tentang ${p.name}`}
              className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 md:size-9"
            >
              <FaWhatsapp className="size-4" />
            </a>
            <Link href={`/p/${p.code}`} className="rounded-full bg-hm-dark px-3.5 py-1.5 text-xs font-medium text-white shadow-md transition hover:bg-hm-deep md:px-4 md:py-2">
              Lihat
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCollection({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const track = useRef<HTMLUListElement>(null);

  const list = useMemo(() => (tab === "all" ? products : products.filter((p) => p.category === tab)), [products, tab]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  function slide(dir: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function pick(key: (typeof TABS)[number]["key"]) {
    setTab(key);
    track.current?.scrollTo({ left: 0 });
  }

  const arrow = "grid size-11 shrink-0 place-items-center rounded-full bg-white/80 text-hm-dark shadow-md ring-1 ring-white transition hover:bg-hm-dark hover:text-white";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" aria-label="Kategori produk" className="mb-3 flex flex-wrap justify-center gap-1.5 md:mb-5 md:gap-2">
        {TABS.filter((t) => counts[t.key]).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => pick(t.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition duration-300 md:px-5 md:py-2 md:text-sm ${
              tab === t.key ? "border-hm-dark bg-hm-dark text-white shadow-md" : "border-hm-dark/20 bg-white/60 text-hm-dark hover:bg-white"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-[11px] md:ml-2 md:text-xs ${tab === t.key ? "text-hm-gold" : "text-hm-muted"}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 items-center gap-3 md:items-stretch">
        <button type="button" onClick={() => slide(-1)} aria-label="Geser ke kiri" className={`${arrow} self-center max-md:hidden`}>
          <FaChevronLeft className="size-4" />
        </button>
        <ul
          ref={track}
          className="flex h-fit min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 [scrollbar-width:none] md:h-auto md:gap-6 md:pb-10 md:pt-3 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((p) => (
            <li key={p.code} className="w-[56%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-4.5rem)/4)]">
              <Card p={p} />
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => slide(1)} aria-label="Geser ke kanan" className={`${arrow} self-center max-md:hidden`}>
          <FaChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
