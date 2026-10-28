"use client";

import { useState } from "react";
import type { SocialPost } from "@/types";
import { FORMAT_LABEL, PLATFORM_META, postEngagement, type TopMetric } from "@/lib/analytics";
import { formatDate, formatNumber } from "@/lib/format";

const TABS: { key: TopMetric; label: string }[] = [
  { key: "engagement", label: "Engagement" },
  { key: "clicks", label: "Klik" },
  { key: "purchases", label: "Purchase" },
];

export function TopContentTabs({ data }: { data: Record<TopMetric, SocialPost[]> }) {
  const [tab, setTab] = useState<TopMetric>("engagement");
  const rows = data[tab];

  return (
    <div>
      <div role="tablist" aria-label="Urutkan berdasarkan" className="mb-3 inline-flex rounded-xl bg-tanah-50 p-1 dark:bg-white/5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === t.key ? "bg-white text-tanah-700 shadow-sm dark:bg-emas dark:text-tanah-900" : "text-ink-soft dark:text-krem/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-tanah-900/10 text-left text-xs uppercase tracking-wide text-ink-soft dark:border-white/10 dark:text-krem/60">
              <th scope="col" className="py-2 pr-2">#</th>
              <th scope="col" className="py-2 pr-2">Konten</th>
              <th scope="col" className="py-2 pr-2">Platform</th>
              <th scope="col" className="py-2 pr-2 text-right">Impression</th>
              <th scope="col" className="py-2 pr-2 text-right">Engagement</th>
              <th scope="col" className="py-2 pr-2 text-right">Klik</th>
              <th scope="col" className="py-2 text-right">Purchase</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id} className="border-b border-tanah-900/5 last:border-0 dark:border-white/5">
                <td className="py-2.5 pr-2 font-display text-lg text-emas">{i + 1}</td>
                <td className="py-2.5 pr-2">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-ink-soft dark:text-krem/60">
                    {FORMAT_LABEL[p.format]} · {formatDate(p.postedAt)}
                  </p>
                </td>
                <td className="py-2.5 pr-2">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="size-2 rounded-full" style={{ background: PLATFORM_META[p.platform].color }} aria-hidden />
                    {PLATFORM_META[p.platform].label}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums">{formatNumber(p.impressions)}</td>
                <td className={`py-2.5 pr-2 text-right tabular-nums ${tab === "engagement" ? "font-semibold" : ""}`}>
                  {formatNumber(postEngagement(p))}
                </td>
                <td className={`py-2.5 pr-2 text-right tabular-nums ${tab === "clicks" ? "font-semibold" : ""}`}>{formatNumber(p.clicks)}</td>
                <td className={`py-2.5 text-right tabular-nums ${tab === "purchases" ? "font-semibold" : ""}`}>{formatNumber(p.purchases)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ink-soft">
                  Belum ada konten di periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
