"use client";

import { Glass } from "glisse";
import { FaCommentDots } from "react-icons/fa6";
import { GlassLink } from "./GlassLink";

/** Kartu kaca promo chatbot ASKA (dulu di Hero). */
export function AskaPromo() {
  return (
    <Glass data-theme="light" className="flex h-[clamp(240px,32vh,280px)] w-full flex-col justify-between rounded-3xl p-5 text-hm-dark shadow-[0_18px_40px_-14px_rgba(62,36,20,.35)] ring-1 ring-hm-dark/15">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-hm-dark/10 ring-1 ring-hm-dark/25">
          <FaCommentDots className="size-5" aria-hidden />
        </span>
        <div>
          <p className="flex items-center gap-2 text-base font-medium">
            Ada chatbot ASKA
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          </p>
          <p className="mt-1 text-sm leading-snug text-hm-dark/80">
            Tanya cara pakai, perawatan, dan kendala produk langsung di halaman tiap produk.
          </p>
        </div>
      </div>
      <div>
        <GlassLink href="#panduan" variant="filled" tint="#3e2414">
          Coba sekarang
        </GlassLink>
      </div>
    </Glass>
  );
}
