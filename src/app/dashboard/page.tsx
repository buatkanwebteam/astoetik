import type { Metadata } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaArrowTrendDown, FaArrowTrendUp, FaCartShopping, FaGlobe, FaHeart, FaInstagram, FaQrcode, FaTiktok, FaYoutube } from "react-icons/fa6";
import { SiShopee } from "react-icons/si";
import type { ReactNode } from "react";
import type { SocialPlatform } from "@/types";
import { getDb } from "@/lib/db";
import {
  byPlatform,
  countEvents,
  dailySeries,
  funnel,
  isSocial,
  parseFilters,
  PLATFORM_META,
  RANGE_OPTIONS,
  ratio,
  SOCIAL_MEDIA,
  sinceDate,
  splitPeriods,
  topContent,
  totals,
  type Filters,
} from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";
import { Card, CardTitle, ExportLink, PageHeader, mutedText } from "@/components/dashboard/ui";
import { Funnel } from "@/components/dashboard/Funnel";
import { HeroChart, TrendChart } from "@/components/dashboard/charts";
import { TopContentTabs } from "@/components/dashboard/TopContentTabs";
import { AdvisorChat } from "@/components/dashboard/AdvisorChat";
import { CountUp, SpotlightCard } from "@/components/dashboard/fx";

export const metadata: Metadata = { title: "Ringkasan" };

const PLATFORM_UI: Record<"tiktok" | "instagram" | "youtube", { icon: IconType; tint: string }> = {
  tiktok: { icon: FaTiktok, tint: "bg-[#d8ebe3] dark:bg-[#1f3a33]" },
  instagram: { icon: FaInstagram, tint: "bg-[#f3dde8] dark:bg-[#3d2231]" },
  youtube: { icon: FaYoutube, tint: "bg-[#e5def1] dark:bg-[#2c2540]" },
};

function qs(f: Filters, patch: Partial<Filters>) {
  const next = { ...f, ...patch };
  return `/dashboard?days=${next.days}&platform=${next.platform}`;
}

function Delta({ cur, prev, className = "" }: { cur: number; prev: number | null; className?: string }) {
  if (prev === null || prev === 0) return null;
  const d = (cur - prev) / prev;
  const up = d >= 0;
  const Icon = up ? FaArrowTrendUp : FaArrowTrendDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"} ${className}`}>
      <Icon className="size-3" aria-hidden />
      {up ? "+" : ""}
      {formatPercent(d)}
      <span className="sr-only"> dibanding periode sebelumnya</span>
    </span>
  );
}

function Kpi({ icon, label, children, delta, note }: { icon: ReactNode; label: string; children: ReactNode; delta?: ReactNode; note?: string }) {
  return (
    <SpotlightCard className="glossy rounded-3xl border border-tanah-900/[0.07] bg-white/60 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex items-center gap-2 text-ink-soft dark:text-krem/70">
        <span className="grid size-7 place-items-center rounded-lg bg-tanah-50 text-tanah-600 dark:bg-white/10 dark:text-emas">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tabular-nums">{children}</p>
      <div className="mt-1 flex min-h-4 items-center gap-2">
        {delta}
        {note && <span className={`text-[11px] ${mutedText}`}>{note}</span>}
      </div>
    </SpotlightCard>
  );
}

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const filters = parseFilters(await props.searchParams);
  const db = getDb();
  const sinceIso = `${sinceDate(filters.days)}T00:00:00.000Z`;
  const [allMetrics, allPosts, events] = await Promise.all([
    db.listSocialMetrics(sinceDate(filters.days * 2)),
    db.listSocialPosts(sinceIso),
    db.listEvents(sinceIso),
  ]);

  const socialMetrics = allMetrics.filter((m) => isSocial(m.platform));
  const shopMetrics = allMetrics.filter((m) => m.platform === "shopee");
  const periods = splitPeriods(socialMetrics, filters.days);
  const { current, previous } = splitPeriods(byPlatform(socialMetrics, filters.platform), filters.days);
  const shop = splitPeriods(shopMetrics, filters.days);
  const shopCur = totals(shop.current);
  const shopPrev = shop.previous ? totals(shop.previous) : null;
  const posts = byPlatform(
    allPosts.filter((x) => isSocial(x.platform)),
    filters.platform,
  );
  const cur = totals(current);
  const prev = previous ? totals(previous) : null;
  const ev = countEvents(events);
  const platforms: SocialPlatform[] = filters.platform === "all" ? SOCIAL_MEDIA : [filters.platform];
  const exportQs = `days=${filters.days}&platform=${filters.platform}`;
  const heroSeries = dailySeries(current).map((row) => ({
    date: row.date,
    value: platforms.reduce((sum, p) => sum + (row[p] ?? 0), 0),
  }));

  return (
    <div className="w-full">
      <PageHeader title={`Ringkasan ${filters.days} Hari Terakhir`} />

      <div className="grid gap-x-6 gap-y-3 *:min-w-0 lg:grid-cols-12">
        <h2 className="font-display text-xl font-semibold lg:col-span-5">Performa</h2>
        <div className="flex items-center justify-between lg:col-span-7">
          <h2 className="font-display text-xl font-semibold">Platform</h2>
          <ExportLink href={`/api/export/all?${exportQs}`} label="Export semua (.xlsx)" />
        </div>

        <SpotlightCard className="glossy rounded-3xl bg-[#efe3d3] p-5 lg:col-span-5 dark:bg-[#33261a]" spotlight="rgba(255,255,255,0.45)">
          <p className="font-display text-3xl font-semibold tabular-nums">
            <CountUp to={cur.impressions} />
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`text-sm ${mutedText}`}>Total impression</span>
            <Delta cur={cur.impressions} prev={prev?.impressions ?? null} />
          </div>
          <div className="-mx-2 mt-2">
            <HeroChart data={heroSeries} />
          </div>
          <div className="mt-2 flex gap-1" aria-label="Rentang waktu">
            {RANGE_OPTIONS.map((d) => (
              <Link
                key={d}
                href={qs(filters, { days: d })}
                scroll={false}
                aria-current={filters.days === d ? "true" : undefined}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filters.days === d ? "bg-tanah-900 text-krem dark:bg-emas dark:text-tanah-900" : "text-ink-soft hover:bg-white/60 dark:text-krem/70 dark:hover:bg-white/10"
                }`}
              >
                {d} hari
              </Link>
            ))}
          </div>
        </SpotlightCard>

        <div className="grid grid-cols-2 gap-3 *:min-w-0 lg:col-span-7 xl:grid-cols-4">
          {SOCIAL_MEDIA.map((p) => {
            const { icon: Icon, tint } = PLATFORM_UI[p as keyof typeof PLATFORM_UI];
            const c = totals(byPlatform(periods.current, p));
            const pv = periods.previous ? totals(byPlatform(periods.previous, p)) : null;
            const active = filters.platform === p;
            return (
              <Link
                key={p}
                href={qs(filters, { platform: active ? "all" : p })}
                scroll={false}
                aria-pressed={active}
                aria-label={`${PLATFORM_META[p].label}${active ? ", filter aktif, klik untuk reset" : ", klik untuk filter"}`}
                className={`glossy group flex flex-col justify-between rounded-3xl p-4 transition hover:-translate-y-0.5 ${tint} ${active ? "ring-2 ring-tanah-900 dark:ring-emas" : ""}`}
              >
                <div>
                  <p className="font-display text-xl font-semibold tabular-nums">
                    <CountUp to={c.impressions} />
                  </p>
                  <p className={`text-xs ${mutedText}`}>{PLATFORM_META[p].label}</p>
                </div>
                <div className="mt-6 flex items-end sm:mt-10 justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-white shadow-sm" style={{ color: PLATFORM_META[p].color }}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <Delta cur={c.impressions} prev={pv?.impressions ?? null} />
                </div>
              </Link>
            );
          })}
          <div className="glossy flex flex-col justify-between rounded-3xl bg-[#dbe7f1] p-4 dark:bg-[#1f2f3d]">
            <div>
              <p className="font-display text-xl font-semibold tabular-nums">
                <CountUp to={ev.page_view} />
              </p>
              <p className={`text-xs ${mutedText}`}>Kunjungan Website</p>
            </div>
            <div className="mt-6 flex items-end sm:mt-10">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-[#2b6cb0] shadow-sm">
                <FaGlobe className="size-[18px]" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 *:min-w-0 sm:grid-cols-3">
        <Kpi
          icon={<FaHeart className="size-3.5" aria-hidden />}
          label="Engagement rate"
          delta={<Delta cur={ratio(cur.engagement, cur.impressions)} prev={prev ? ratio(prev.engagement, prev.impressions) : null} />}
        >
          <CountUp to={ratio(cur.engagement, cur.impressions) * 100} decimals={2} suffix="%" />
        </Kpi>
        <Kpi icon={<FaCartShopping className="size-3.5" aria-hidden />} label="Purchase online shop" delta={<Delta cur={shopCur.purchases} prev={shopPrev?.purchases ?? null} />}>
          <CountUp to={shopCur.purchases} />
        </Kpi>
        <Kpi icon={<FaQrcode className="size-3.5" aria-hidden />} label="QR scan">
          <CountUp to={ev.qr_scan} />
        </Kpi>
      </div>

      <div className="mt-6 grid gap-6 *:min-w-0 lg:grid-cols-12">
        <Card className="lg:col-span-12 xl:col-span-5">
          <CardTitle action={<ExportLink href={`/api/export/posts?${exportQs}`} />}>Top Performed Content</CardTitle>
          <TopContentTabs
            data={{
              engagement: topContent(posts, "engagement"),
              clicks: topContent(posts, "clicks"),
              }}
          />
        </Card>

        <Card className="lg:col-span-6 xl:col-span-3">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">Platform Penjualan Terbaik</h2>
            <p className={`mt-0.5 text-xs ${mutedText}`}>Purchase dari online shop, bukan dari media sosial</p>
          </div>
          <div className="rounded-2xl bg-tanah-50 p-4 dark:bg-white/5">
            <p className={`text-xs font-medium ${mutedText}`}>Total purchase</p>
            <p className="mt-1 flex items-baseline gap-2 font-display text-3xl font-semibold tabular-nums">
              <CountUp to={shopCur.purchases} />
              <Delta cur={shopCur.purchases} prev={shopPrev?.purchases ?? null} />
            </p>
          </div>
          <ol className="mt-4 space-y-3" aria-label="Peringkat platform penjualan">
            <li className="flex items-center gap-3">
              <span className="font-display text-lg text-emas" aria-hidden>1</span>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f8e2d0] text-[#e8590c] dark:bg-[#40291a]">
                <SiShopee className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Shopee</p>
                <p className={`text-xs ${mutedText}`}>
                  {formatNumber(shopCur.marketplaceClicks)} klik, konversi {formatPercent(ratio(shopCur.purchases, shopCur.marketplaceClicks), 1)}
                </p>
              </div>
              <p className="font-display text-xl font-semibold tabular-nums">{formatNumber(shopCur.purchases)}</p>
            </li>
          </ol>
        </Card>

        <AdvisorChat days={filters.days} className="lg:col-span-6 xl:col-span-4" />
      </div>

      <div className="mt-6 grid gap-6 *:min-w-0 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardTitle action={<ExportLink href={`/api/export/funnel?${exportQs}`} />}>Customer Journey Funnel</CardTitle>
          <Funnel stages={funnel({ ...cur, purchases: shopCur.purchases })} />
        </Card>
        <Card className="flex flex-col lg:col-span-3">
          <CardTitle action={<ExportLink href={`/api/export/metrics?${exportQs}`} />}>Tren Impression Harian</CardTitle>
          <div className="min-h-72 flex-1">
            <TrendChart data={dailySeries(periods.current)} platforms={SOCIAL_MEDIA} />
          </div>
        </Card>
      </div>

    </div>
  );
}
