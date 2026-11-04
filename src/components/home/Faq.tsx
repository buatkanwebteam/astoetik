"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WordReveal } from "./motion";
import { FaMinus, FaPlus } from "react-icons/fa6";

const ITEMS = [
  {
    q: "Apa itu Product Passport?",
    a: "Halaman identitas produk yang terbuka saat QR di produk dipindai: spesifikasi, panduan penggunaan, dan jalur bantuan sesuai model yang Anda pegang.",
  },
  {
    q: "Apa yang bisa ditanyakan ke ASKA-AI?",
    a: "Cara penggunaan, perawatan, dan kendala umum produk Astoetik. Jawaban mengacu pada informasi produk yang tersedia. Bila tidak ditemukan, Anda diarahkan ke petugas Astoetik.",
  },
  {
    q: "Apakah ASKA bisa mendiagnosis kerusakan?",
    a: "Tidak. ASKA memberi langkah pengecekan awal. Untuk masalah teknis atau keselamatan, ikuti panduan resmi atau hubungi layanan Astoetik.",
  },
  {
    q: "Bagaimana cara mengajukan klaim garansi?",
    a: "Hubungi Astoetik lewat WhatsApp dengan menyertakan kode model atau nomor seri. Pengajuan tidak otomatis berarti klaim disetujui; status garansi diperiksa pada data resmi.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div id="aska" className="grid w-full gap-6 border-b border-white/15 pb-8 lg:gap-12 lg:grid-cols-[2fr_3fr]">
      <div className="contents">
        <div>
          <WordReveal
            text="Pertanyaan yang sering diajukan"
            className="font-display text-3xl font-medium leading-[1.1] tracking-[-0.03em] md:text-4xl"
          />
          <p className="mt-3 max-w-sm text-sm text-hm-gold/70">Jawaban singkat tentang QR, ASKA-AI, dan layanan purnajual.</p>
        </div>
        <ul className="divide-y divide-white/15 border-y border-white/15">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <li key={it.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-3.5 text-left text-base font-medium"
                >
                  {it.q}
                  {isOpen ? <FaMinus className="size-4 shrink-0" aria-hidden /> : <FaPlus className="size-4 shrink-0" aria-hidden />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-4 text-sm text-white/70">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
