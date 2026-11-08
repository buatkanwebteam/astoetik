"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-tanah-100 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/25">
        <Image
          src={images[active]}
          alt={`Foto ${name}${active > 0 ? ` (${active + 1})` : ""}`}
          fill
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover"
          priority
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-2.5" role="tablist" aria-label="Foto lainnya">
          {images.map((src, i) => (
            <button
              key={`${i}-${src.slice(0, 64)}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Lihat foto ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 overflow-hidden rounded-2xl bg-tanah-100 ring-2 transition ${
                i === active ? "ring-hm-gold" : "opacity-60 ring-transparent hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
