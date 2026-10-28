"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-tanah-900/10">
        <Image
          src={images[active]}
          alt={`Foto ${name}${active > 0 ? ` (${active + 1})` : ""}`}
          fill
          sizes="(max-width: 480px) 100vw, 440px"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Foto lainnya">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Lihat foto ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative h-14 w-16 overflow-hidden rounded-lg ring-2 transition ${
                i === active ? "ring-emas" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
