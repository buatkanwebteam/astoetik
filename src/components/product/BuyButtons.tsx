"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import type { MarketplaceLinks } from "@/types";
import { track } from "./track";

export function BuyButtons({
  productCode,
  links,
  waHref,
}: {
  productCode: string;
  links: MarketplaceLinks;
  waHref: string;
}) {
  const entries = (Object.entries(links) as [keyof MarketplaceLinks, string | undefined][]).filter(
    (e): e is [keyof MarketplaceLinks, string] => Boolean(e[1]),
  );
  const label: Record<keyof MarketplaceLinks, string> = { shopee: "Shopee", tokopedia: "Tokopedia" };

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {entries.map(([key, href]) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(productCode, "marketplace_click", { marketplace: key })}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 ${
                key === "shopee" ? "bg-[#c2410c]" : "bg-[#237032]"
              }`}
            >
              <ShoppingBag className="size-4" aria-hidden />
              Beli di {label[key]}
            </a>
          ))}
        </div>
      )}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-tanah-600 bg-white px-4 py-3 text-sm font-semibold text-tanah-700 transition hover:bg-tanah-50"
      >
        <MessageCircle className="size-4" aria-hidden />
        Tanya CS via WhatsApp
      </a>
    </div>
  );
}
