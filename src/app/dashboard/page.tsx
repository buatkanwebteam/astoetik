import type { Metadata } from "next";
import { Eye, Heart, MousePointerClick, QrCode, ShoppingCart, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { SocialPlatform } from "@/types";
import { SOCIAL_PLATFORMS } from "@/types";
import { getDb } from "@/lib/db";
import {
  byPlatform,
  countEvents,
  dailySeries,
  funnel,
  parseFilters,
  PLATFORM_META,
  RANGE_OPTIONS,
  ratio,
  sinceDate,
  splitPeriods,
  summaryByFormat,
  summaryByPlatform,
  topContent,
  totals,
  type Filters,
  type GroupSummary,
} from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";
import { Card, CardTitle, Chip, DummyBadge, ExportLink, PageHeader, mutedText } from "@/components/dashboard/ui";
import { Funnel } from "@/components/dashboard/Funnel";
import { GroupBarChart, TrendChart } from "@/components/dashboard/charts";
import { TopContentTabs } from "@/components/dashboard/TopContentTabs";
import { AdvisorPanel } from "@/components/dashboard/AdvisorPanel";

export const metadata: Metadata = { title: "Ringkasan" };

function qs(f: Filters, patch: Partial<Filters>) {
  const next = { ...f, ...patch };
  return `/dashboard?days=${next.days}&platform=${next.platform}`;
}

function Delta({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev === null || prev === 0) return null;
  const d = (cur - prev) / prev;
  const up = d >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
      <Icon className="size-3.5" aria-hidden />
      {up ? "+" : ""}
      {formatPercent(d)}
      <span className="sr-only"> dibanding periode sebelumnya</span>
    </span>
  );
}

function Kpi({ icon, label, value, delta, note }: { icon: ReactNode; label: string; value: string; delta?: ReactNode; note?: string }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-2 text-ink-soft dark:text-krem/70">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {delta}
        {note && <span className={`text-[11px] ${mutedText}`}>{note}</span>}
      </div>
    </Card>
  );
}

function narrative(byFormat: GroupSummary[], byPlat: GroupSummary[]): string[] {
  const out: string[] = [];
  const bestFormat = byFormat[0];
  const worstFormat = byFormat.at(-1);
  if (bestFormat && worstFormat && bestFormat !== worstFormat) {
    out.push(
      `Format ${bestFormat.label} punya engagement rate tertinggi (${formatPercent(bestFormat.engagementRate)}), ${worstFormat.label} terendah (${formatPercent(worstFormat.engagementRate)}).`,
    );
  }
  const topBuy = [...byFormat].sort((a, b) => b.purchases - a.purchases)[0];
  if (topBuy) out.push(`${topBuy.label} menyumbang purchase terbanyak dari konten (${formatNumber(topBuy.purchases)}).`);
  const bestPlat = byPlat[0];
  if (bestPlat) out.push(`Di level platform, ${bestPlat.label} paling engaging dengan rata-rata ${formatNumber(bestPlat.avgImpressions)} impression per konten.`);
  return out;
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

  const { current, previous } = splitPeriods(byPlatform(allMetrics, filters.platform), filters.days);
  const posts = byPlatform(allPosts, filters.platform);
  const cur = totals(current);
  const prev = previous ? totals(previous) : null;
  const ev = countEvents(events);
  const platforms: SocialPlatform[] = filters.platform === "all" ? SOCIAL_PLATFORMS : [filters.platform];
  const byFormat = summaryByFormat(posts);
  const byPlat = summaryByPlatform(posts);
  const exportQs = `days=${filters.days}&platform=${filters.platform}`;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Ringkasan Performa" subtitle={`${filters.days} hari terakhir · ${filters.platform === "all" ? "semua platform" : PLATFORM_META[filters.platform].label}`}>
        <DummyBadge />
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Rentang waktu">
          <span className={`mr-1 text-xs ${mutedText}`}>Periode</span>
          {RANGE_OPTIONS.map((d) => (
            <Chip key={d} href={qs(filters, { days: d })} active={filters.days === d}>
              {d} hari
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Platform">
          <span className={`mr-1 text-xs ${mutedText}`}>Platform</span>
          <Chip href={qs(filters, { platform: "all" })} active={filters.platform === "all"}>
            Semua
          </Chip>
          {SOCIAL_PLATFORMS.map((p) => (
            <Chip key={p} href={qs(filters, { platform: p })} active={filters.platform === p}>
              {PLATFORM_META[p].label}
            </Chip>
          ))}
        </div>
        <div className="ml-auto">
          <ExportLink href={`/api/export/all?${exportQs}`} label="Export semua (.xlsx)" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Kpi icon={<Eye className="size-4" aria-hidden />} label="Impression" value={formatNumber(cur.impressions)} delta={<Delta cur={cur.impressions} prev={prev?.impressions ?? null} />} />
        <Kpi
          icon={<Heart className="size-4" aria-hidden />}
          label="Engagement rate"
          value={formatPercent(ratio(cur.engagement, cur.impressions), 2)}
          delta={<Delta cur={ratio(cur.engagement, cur.impressions)} prev={prev ? ratio(prev.engagement, prev.impressions) : null} />}
        />
        <Kpi icon={<MousePointerClick className="size-4" aria-hidden />} label="Klik marketplace" value={formatNumber(cur.marketplaceClicks)} delta={<Delta cur={cur.marketplaceClicks} prev={prev?.marketplaceClicks ?? null} />} />
        <Kpi icon={<ShoppingCart className="size-4" aria-hidden />} label="Purchase" value={formatNumber(cur.purchases)} delta={<Delta cur={cur.purchases} prev={prev?.purchases ?? null} />} />
        <Kpi icon={<QrCode className="size-4" aria-hidden />} label="QR scan" value={formatNumber(ev.qr_scan)} note={`data nyata · ${formatNumber(ev.page_view)} page view`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardTitle action={<ExportLink href={`/api/export/funnel?${exportQs}`} />}>Customer Journey Funnel</CardTitle>
          <Funnel stages={funnel(cur)} />
        </Card>
        <Card className="lg:col-span-3">
          <CardTitle action={<ExportLink href={`/api/export/metrics?${exportQs}`} />}>Tren Impression Harian</CardTitle>
          <TrendChart data={dailySeries(current)} platforms={platforms} />
        </Card>
      </div>

      <div className="mt-6">
        <AdvisorPanel filters={filters} />
      </div>

      <Card className="mt-6">
        <CardTitle action={<ExportLink href={`/api/export/posts?${exportQs}`} />}>Top Performed Content</CardTitle>
        <TopContentTabs
          data={{
            engagement: topContent(posts, "engagement"),
            clicks: topContent(posts, "clicks"),
            purchases: topContent(posts, "purchases"),
          }}
        />
      </Card>

      <Card className="mt-6">
        <CardTitle>Summarized Performance Content</CardTitle>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className={`mb-2 text-sm font-medium ${mutedText}`}>Per format konten</h3>
            <GroupBarChart data={byFormat} />
          </div>
          <div>
            <h3 className={`mb-2 text-sm font-medium ${mutedText}`}>Per platform</h3>
            <GroupBarChart data={byPlat} colors={Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p, PLATFORM_META[p].color]))} />
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-tanah-50 p-4 text-sm leading-relaxed dark:bg-white/5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-tanah-600 dark:text-emas">Ringkasan otomatis</p>
          <ul className="list-disc space-y-1 pl-5">
            {narrative(byFormat, byPlat).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className={`mt-2 text-xs ${mutedText}`}>Analisis AI yang lebih dalam ada di panel AI Advisor di atas.</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className={`border-b border-tanah-900/10 text-left text-xs uppercase tracking-wide dark:border-white/10 ${mutedText}`}>
                <th scope="col" className="py-2">Format</th>
                <th scope="col" className="py-2 text-right">Konten</th>
                <th scope="col" className="py-2 text-right">Impression</th>
                <th scope="col" className="py-2 text-right">Eng. rate</th>
                <th scope="col" className="py-2 text-right">Klik</th>
                <th scope="col" className="py-2 text-right">Purchase</th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((g) => (
                <tr key={g.key} className="border-b border-tanah-900/5 last:border-0 dark:border-white/5">
                  <td className="py-2 font-medium">{g.label}</td>
                  <td className="py-2 text-right tabular-nums">{g.posts}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(g.impressions)}</td>
                  <td className="py-2 text-right tabular-nums">{formatPercent(g.engagementRate, 2)}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(g.clicks)}</td>
                  <td className="py-2 text-right tabular-nums">{formatNumber(g.purchases)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
