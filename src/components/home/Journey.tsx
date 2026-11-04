"use client";

import { useState } from "react";
import { FaCommentDots, FaQrcode } from "react-icons/fa6";
import { WordReveal } from "./motion";
import { AskaChat, type ChatProduct } from "./AskaChat";
import { QrCheck } from "./QrCheck";
import AeroShards from "./AeroShards";

type Mode = "qr" | "chat";

const OPTIONS: { mode: Mode; title: string; desc: string; Icon: typeof FaQrcode }[] = [
  { mode: "qr", title: "Cek QR produk Anda", desc: "Sudah punya produk Astoetik? Pindai QR-nya untuk panduan dan bantuan.", Icon: FaQrcode },
  { mode: "chat", title: "Tanya ASKA", desc: "Belum punya QR? Langsung tanya asisten AI soal produk.", Icon: FaCommentDots },
];

export function Journey({ products }: { products: ChatProduct[] }) {
  const [mode, setMode] = useState<Mode>("chat");

  return (
    <section id="panduan" className="relative h-[calc(100vh+33px)] min-h-[620px] w-full overflow-hidden bg-hm-deep text-white">
      <div className="absolute inset-0" aria-hidden>
        <AeroShards
          shardColor="#f0cf8a"
          accentColor="#d9822b"
          backgroundColor="#2a190e"
          placement="full"
          count={650}
          glow={0.3}
          vignette={0.45}
          dpr={1.25}
        />
      </div>

      <div className="relative flex h-full w-full flex-col gap-6 px-4 pb-[calc(1.5rem+33px)] pt-8 md:px-12 lg:grid lg:grid-cols-[1fr_minmax(0,36rem)] lg:gap-16 lg:pb-[calc(2rem+33px)] lg:pt-12">
        <div className="flex flex-col lg:min-h-0">
          <WordReveal
            text="Terhubung sebelum dan sesudah pembelian."
            className="font-display max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.035em] md:text-5xl lg:text-6xl"
          />
          <div role="radiogroup" aria-label="Pilih cara terhubung" className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {OPTIONS.map(({ mode: m, title, desc, Icon }) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(m)}
                  className={`rounded-2xl p-4 text-left transition duration-300 ${
                    active
                      ? "bg-hm-gold/20 ring-2 ring-hm-gold shadow-[0_12px_30px_-14px_rgba(240,207,138,.5)]"
                      : "bg-white/5 ring-1 ring-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className={`grid size-10 place-items-center rounded-full ${active ? "bg-hm-gold text-hm-deep" : "bg-white/10 text-hm-gold"}`}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <p className="mt-3 text-base font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-snug text-white/70">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 lg:h-full lg:flex-none">
          {mode === "chat" ? <AskaChat products={products} /> : <QrCheck products={products} />}
        </div>
      </div>
    </section>
  );
}
