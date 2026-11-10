"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaArrowRightLong, FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6";

const SLIDES = [4, 2, 1, 3].map((n, idx) => ({
  src: `/home/recap/tijos-${n}.jpeg`,
  alt: `Recap TIJOS, Universitas Negeri Yogyakarta, foto ${idx + 1} dari 4`,
}));

/** Kartu "Event Recap": klik untuk membuka pop up slide foto dokumentasi. */
export function RecapCard({ className, bg }: { className: string; bg: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  const prev = useCallback(() => setI((v) => (v + SLIDES.length - 1) % SLIDES.length), []);
  const next = useCallback(() => setI((v) => (v + 1) % SLIDES.length), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, prev, next]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label="Buka foto Event Recap"
        className={`${className} ${bg} w-full cursor-pointer text-left transition hover:-translate-y-1`}
      >
        <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 size-56 rounded-full bg-white/15" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-64 rounded-[50%] bg-white/10" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85">Dokumentasi</p>
        <h3 className="relative mt-4 font-display text-4xl font-semibold tracking-tight">Event Recap</h3>
        <p className="relative mt-2 max-w-[16rem] text-sm leading-snug text-white/90">Dokumentasi kegiatan, pameran, dan kolaborasi.</p>
        <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
          <p className="max-w-[12rem] text-xs leading-snug text-white/70">Lihat foto kegiatan TIJOS 2026.</p>
          <FaArrowRightLong className="size-7 shrink-0 text-white/90" aria-hidden />
        </div>
      </button>

      {open &&
        createPortal(
          <div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Event Recap"
            className="fixed inset-0 z-[9999] grid place-items-center overscroll-contain bg-hm-deep/40 p-3 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <div className="relative flex max-h-[96vh] w-full max-w-lg flex-col rounded-3xl bg-white p-4 text-[#141414] shadow-2xl md:p-5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-hm-dark/20 bg-white hover:bg-hm-gold/30"
              >
                <FaXmark className="size-4" />
              </button>
              <p className="text-xs uppercase tracking-[0.25em] text-hm-mid">Event Recap</p>
              <h2 className="mb-3 mt-0.5 pr-10 font-display text-2xl font-medium tracking-[-0.03em]">TIJOS 2026</h2>

              <div className="relative min-h-0 flex-1">
                <Image
                  key={SLIDES[i].src}
                  src={SLIDES[i].src}
                  alt={SLIDES[i].alt}
                  width={1009}
                  height={1280}
                  sizes="(min-width: 512px) 480px, 92vw"
                  priority
                  className="mx-auto h-auto max-h-[calc(96vh-11rem)] w-auto max-w-full rounded-2xl object-contain"
                />
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto sebelumnya"
                  className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow ring-1 ring-black/10 hover:bg-white"
                >
                  <FaChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Foto berikutnya"
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow ring-1 ring-black/10 hover:bg-white"
                >
                  <FaChevronRight className="size-4" aria-hidden />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Pilih foto">
                {SLIDES.map((s, n) => (
                  <button
                    key={s.src}
                    type="button"
                    role="tab"
                    aria-selected={n === i}
                    aria-label={`Foto ${n + 1}`}
                    onClick={() => setI(n)}
                    className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-hm-dark" : "w-2 bg-hm-dark/25 hover:bg-hm-dark/50"}`}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
