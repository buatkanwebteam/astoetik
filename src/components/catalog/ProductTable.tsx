"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import type { ProductCategory } from "@/types";
import type { CatalogItem } from "@/lib/catalog";
import { formatRupiah } from "@/lib/format";
import { ProductLinks, iconBtn } from "./ProductCard";

export function ProductTable({
  items,
  categoryLabel,
  onEdit,
}: {
  items: CatalogItem[];
  categoryLabel: Record<ProductCategory, string>;
  onEdit: (code: string) => void;
}) {
  const th = "px-3 py-2.5 text-left text-[11px] font-medium text-kat-muted";
  const td = "px-3 py-2.5 align-middle";

  return (
    // `relative` keeps the absolutely positioned sr-only labels inside the scroll box.
    <div className="relative overflow-x-auto rounded-md border border-kat-line bg-kat-card">
      <table className="w-full min-w-[62rem] text-sm">
        <thead className="border-b border-kat-line bg-kat-raised">
          <tr>
            <th scope="col" className={`${th} w-14`}>
              <span className="sr-only">Foto</span>
            </th>
            <th scope="col" className={th}>Kode</th>
            <th scope="col" className={th}>Nama</th>
            <th scope="col" className={th}>Kategori</th>
            <th scope="col" className={th}>Bahan</th>
            <th scope="col" className={`${th} text-right`}>Daya</th>
            <th scope="col" className={th}>Kontrol</th>
            <th scope="col" className={th}>Sertifikasi</th>
            <th scope="col" className={`${th} text-right`}>Harga</th>
            <th scope="col" className={`${th} text-right`}>
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kat-line">
          {items.map((i) => (
            <tr key={i.code}>
              <td className={td}>
                <div className="relative size-10 overflow-hidden rounded-sm bg-kat-raised">
                  <Image src={i.image} alt="" fill sizes="40px" className="object-cover" />
                </div>
              </td>
              <td className={`${td} whitespace-nowrap font-mono text-xs text-aksen-text`}>{i.code}</td>
              <th scope="row" className={`${td} min-w-56 text-left font-medium text-kat-text`}>
                {i.name}
              </th>
              <td className={`${td} whitespace-nowrap text-kat-muted`}>{categoryLabel[i.category]}</td>
              <td className={`${td} text-kat-muted`}>{i.material ?? "–"}</td>
              <td className={`${td} whitespace-nowrap text-right font-mono tabular-nums text-kat-muted`}>
                {i.watt ? `${i.watt} W` : "–"}
              </td>
              <td className={`${td} text-kat-muted`}>{i.control ?? "–"}</td>
              <td className={`${td} whitespace-nowrap text-xs text-kat-muted`}>
                {[i.sni ? "SNI" : null, i.tkdn ? `TKDN ${i.tkdn}` : null].filter(Boolean).join(" · ") || "–"}
              </td>
              <td className={`${td} whitespace-nowrap text-right font-mono tabular-nums text-kat-text`}>{formatRupiah(i.price)}</td>
              <td className={td}>
                <div className="flex justify-end gap-1.5">
                  <ProductLinks code={i.code} />
                  <button type="button" onClick={() => onEdit(i.code)} className={iconBtn} aria-label={`Edit ${i.name}`} title="Edit">
                    <Pencil className="size-4" aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
