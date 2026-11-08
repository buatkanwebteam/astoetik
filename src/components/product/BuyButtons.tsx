"use client";

import { FaBagShopping, FaWhatsapp } from "react-icons/fa6";
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
  const tone: Record<keyof MarketplaceLinks, string> = {
    shopee: "from-[#f05a35] to-[#c2410c]",
    tokopedia: "from-[#35a853] to-[#237032]",
  };

  return (
    <div className="space-y-3">
      {entries.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(([key, href]) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track(productCode, "marketplace_click", { marketplace: key })}
              className={`flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-b px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 ${tone[key]}`}
            >
              <FaBagShopping className="size-4" aria-hidden />
              Beli di {label[key]}
            </a>
          ))}
        </div>
      )}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 rounded-full bg-white/10 px-5 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
      >
        <FaWhatsapp className="size-[18px]" aria-hidden />
        Tanya CS via WhatsApp
      </a>
    </div>
  );
}
