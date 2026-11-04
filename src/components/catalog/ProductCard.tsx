"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Boxes, ExternalLink, Pencil, QrCode } from "lucide-react";
import type { CatalogItem } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";

export const iconBtn =
  "grid size-9 place-items-center rounded-sm border border-kat-line text-kat-muted transition-colors duration-150 hover:border-kat-muted hover:text-kat-text";

function badgeOf(item: CatalogItem): { label: string; tone: "emas" | "plain" } | null {
  if (item.sni) return { label: "SNI", tone: "emas" };
  if (item.note === "Portabel") return { label: "Portabel", tone: "plain" };
  if (item.tkdn) return { label: `TKDN ${item.tkdn}`, tone: "plain" };
  return null;
}

/** Units, QR download and public page links, shared by grid and table views. */
export function ProductLinks({ code }: { code: string }) {
  return (
    <>
      <Link href={`/dashboard/products/${code}`} className={iconBtn} aria-label={`Kelola unit ${code}`} title="Kelola unit & QR per unit">
        <Boxes className="size-4" aria-hidden />
      </Link>
      <a href={`/api/qr/${code}?download=1`} className={iconBtn} aria-label={`Unduh QR ${code}`} title="Unduh QR jenis produk (PNG)">
        <QrCode className="size-4" aria-hidden />
      </a>
      <a
        href={`/p/${code}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        aria-label={`Buka halaman publik ${code}`}
        title="Buka halaman umum produk"
      >
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </>
  );
}

export function ProductCard({
  item,
  categoryLabel,
  priority,
  onEdit,
}: {
  item: CatalogItem;
  categoryLabel: string;
  priority: boolean;
  onEdit: () => void;
}) {
  const badge = badgeOf(item);
  const meta = [item.material, item.watt ? `${item.watt} W` : null, item.control].filter(Boolean).join(" · ");

  return (
    <article className="flex h-full flex-col rounded-md border border-kat-line bg-kat-card">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-md bg-kat-raised">
        <Image
          src={item.image}
          alt={item.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
          className="object-cover"
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-sm px-2 py-1 font-mono text-[11px] font-medium leading-none ${
              badge.tone === "emas" ? "bg-emas text-ink" : "bg-white/90 text-ink ring-1 ring-black/10"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-2 font-mono text-[11px] text-kat-muted">
          <span className="text-aksen-text">{item.code}</span>
          <span aria-hidden>/</span>
          <span className="truncate">{categoryLabel}</span>
        </p>
        <h3 className="mt-1.5 font-grotesk text-base font-semibold leading-snug text-kat-text">{item.name}</h3>
        {meta && <p className="mt-1 text-xs text-kat-muted">{meta}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="font-grotesk text-lg font-semibold tabular-nums text-kat-text">{formatRupiah(item.price)}</p>
          <div className="flex items-center gap-1.5">
            <ProductLinks code={item.code} />
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 items-center gap-1.5 rounded-sm bg-aksen-deep px-3 font-grotesk text-sm font-semibold text-on-aksen transition-colors duration-150 hover:bg-aksen"
              aria-label={`Edit ${item.name}`}
            >
              <Pencil className="size-3.5" aria-hidden />
              Edit
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ children }: { children: ReactNode }) {
  return <ul className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 2xl:grid-cols-3">{children}</ul>;
}
