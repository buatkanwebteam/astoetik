"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { WordReveal } from "./motion";
import { GlassLink } from "./GlassLink";
import { HeroVideo } from "./HeroVideo";import { Glass } from "glisse";
import { FaBars, FaXmark } from "react-icons/fa6";

export const NAV = [
  { href: "#tentang", label: "Tentang" },
  { href: "#produk", label: "Produk" },
  { href: "#panduan", label: "Smart Guide" },
  { href: "#aska", label: "ASKA-AI" },
  { href: "#event", label: "Event & Partner" },
];

const VIDEO_ID = "uPyh9glWPvQ";
const VIDEO_START = 48;

export function Hero() {
  const [open, setOpen] = useState(false);
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-hm-deep text-white">
      <HeroVideo videoId={VIDEO_ID} start={VIDEO_START} />
      {/* Gradien halus: atas -> bawah dan bawah -> atas (sisi video tetap terlihat) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-hm-deep/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-hm-deep/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-hm-deep/15" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-4 md:px-6">
        <header className="relative z-30 -mx-4 grid h-20 grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-hm-deep/40 backdrop-blur-xl px-4 md:-mx-6 md:px-6">
          <Link href="/" aria-label="Astoetik, beranda" className="justify-self-start">
            <Image src="/home/logo-astoetik.png" alt="Astoetik" width={563} height={278} priority className="h-12 w-auto transition duration-300 hover:scale-105" />
          </Link>
          <Glass className="hidden rounded-full px-5 py-2.5 lg:block">
            <nav className="flex items-center gap-6 whitespace-nowrap text-sm text-white" aria-label="Menu utama">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="relative py-1 text-white/85 transition-colors duration-300 hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-hm-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </Glass>
          <div className="col-start-3 flex items-center justify-self-end gap-3 text-sm">
            <span className="hidden sm:block">
              <GlassLink href="#produk">Lihat produk</GlassLink>
            </span>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full border border-white/30 transition duration-300 hover:bg-white/15 lg:hidden"
            >
              {open ? <FaXmark className="size-4" /> : <FaBars className="size-4" />}
            </button>
          </div>
        </header>

        {open && (
          <div className="absolute right-4 top-20 z-20 w-56 rounded-2xl bg-white p-2 lg:hidden text-sm text-[#141414] shadow-2xl md:right-6">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 hover:bg-hm-sand">
                {n.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-1 flex-col justify-end gap-10 pb-12 pt-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <WordReveal
              as="h1"
              text="Toko Batik Astoetik"
              className="font-display text-5xl font-medium leading-[1.04] tracking-[-0.035em] md:text-7xl"
            />
            <p className="mt-6 max-w-md text-base text-white/80">
              Teknologi batik, pengetahuan produk, pendampingan AI, dan kemudahan digital commerce dalam satu ekosistem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GlassLink href="#kebutuhan" variant="filled" tint="#8c5a2f">
                Mulai sekarang
              </GlassLink>
              <GlassLink href="#produk">Jelajahi produk</GlassLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
