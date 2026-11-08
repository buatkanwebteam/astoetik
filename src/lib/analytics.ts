import type { PostFormat, SocialMetric, SocialPlatform, SocialPost, TrackEvent } from "@/types";

/** Social media only. Shopee is an online shop (sales platform), not social media. */
export const SOCIAL_MEDIA: SocialPlatform[] = ["tiktok", "instagram", "youtube"];
export const isSocial = (p: SocialPlatform) => SOCIAL_MEDIA.includes(p);

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];
export type PlatformFilter = SocialPlatform | "all";

export interface Filters {
  days: RangeDays;
  platform: PlatformFilter;
}

export const PLATFORM_META: Record<SocialPlatform, { label: string; color: string }> = {
  tiktok: { label: "TikTok", color: "#0f9e99" },
  instagram: { label: "Instagram", color: "#c2338a" },
  shopee: { label: "Shopee", color: "#e8590c" },
  youtube: { label: "YouTube", color: "#c92a2a" },
};

export const FORMAT_LABEL: Record<PostFormat, string> = {
  reel: "Reel",
  carousel: "Carousel",
  video: "Video",
  live: "Live",
};

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const d = Number(sp.days);
  const days = (RANGE_OPTIONS as readonly number[]).includes(d) ? (d as RangeDays) : 30;
  const p = String(sp.platform ?? "all");
  const platform = (SOCIAL_MEDIA as string[]).includes(p) ? (p as SocialPlatform) : "all";
  return { days, platform };
}

/** YYYY-MM-DD for `days` days ago (inclusive window ending today, UTC). */
export function sinceDate(days: number, now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString().slice(0, 10);
}

export function byPlatform<T extends { platform: SocialPlatform }>(rows: T[], platform: PlatformFilter): T[] {
  return platform === "all" ? rows : rows.filter((r) => r.platform === platform);
}

export interface Totals {
  impressions: number;
  engagement: number;
  profileVisits: number;
  marketplaceClicks: number;
  purchases: number;
}

export function totals(metrics: SocialMetric[]): Totals {
  return metrics.reduce<Totals>(
    (t, m) => ({
      impressions: t.impressions + m.impressions,
      engagement: t.engagement + m.engagement,
      profileVisits: t.profileVisits + m.profileVisits,
      marketplaceClicks: t.marketplaceClicks + m.marketplaceClicks,
      purchases: t.purchases + m.purchases,
    }),
    { impressions: 0, engagement: 0, profileVisits: 0, marketplaceClicks: 0, purchases: 0 },
  );
}

export const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

/** Split metrics into the current window and the equally long window before it. */
export function splitPeriods(metrics: SocialMetric[], days: number, now = new Date()) {
  const curStart = sinceDate(days, now);
  const prevStart = sinceDate(days * 2, now);
  const current = metrics.filter((m) => m.date >= curStart);
  const previous = metrics.filter((m) => m.date >= prevStart && m.date < curStart);
  // Only compare when the previous window is fully covered by data.
  const prevDays = new Set(previous.map((m) => m.date)).size;
  return { current, previous: prevDays >= days ? previous : null };
}

export interface FunnelStage {
  key: keyof Totals;
  label: string;
  value: number;
  fromPrev: number | null;
  fromTop: number;
}

export function funnel(t: Totals): FunnelStage[] {
  const stages: [keyof Totals, string][] = [
    ["impressions", "Impression"],
    ["engagement", "Engagement"],
    ["profileVisits", "Profile Visit"],
    ["marketplaceClicks", "Klik Marketplace"],
    ["purchases", "Purchase"],
  ];
  return stages.map(([key, label], i) => ({
    key,
    label,
    value: t[key],
    fromPrev: i === 0 ? null : ratio(t[key], t[stages[i - 1][0]]),
    fromTop: ratio(t[key], t.impressions),
  }));
}

export type DailyPoint = { date: string } & Partial<Record<SocialPlatform, number>>;

export function dailySeries(metrics: SocialMetric[], field: keyof Totals = "impressions"): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  for (const m of metrics) {
    const row = map.get(m.date) ?? { date: m.date };
    row[m.platform] = (row[m.platform] ?? 0) + m[field];
    map.set(m.date, row);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export const postEngagement = (p: SocialPost) => p.likes + p.comments + p.shares + p.saves;

export type TopMetric = "engagement" | "clicks" | "purchases";

export function topContent(posts: SocialPost[], metric: TopMetric, n = 5): SocialPost[] {
  const score = (p: SocialPost) => (metric === "engagement" ? postEngagement(p) : p[metric]);
  return [...posts].sort((a, b) => score(b) - score(a)).slice(0, n);
}

export interface GroupSummary {
  key: string;
  label: string;
  posts: number;
  impressions: number;
  engagement: number;
  clicks: number;
  purchases: number;
  engagementRate: number;
  avgImpressions: number;
}

function summarize(posts: SocialPost[], keyOf: (p: SocialPost) => string, labelOf: (k: string) => string): GroupSummary[] {
  const groups = new Map<string, SocialPost[]>();
  for (const p of posts) groups.set(keyOf(p), [...(groups.get(keyOf(p)) ?? []), p]);
  return [...groups.entries()]
    .map(([key, list]) => {
      const impressions = list.reduce((s, p) => s + p.impressions, 0);
      const engagement = list.reduce((s, p) => s + postEngagement(p), 0);
      return {
        key,
        label: labelOf(key),
        posts: list.length,
        impressions,
        engagement,
        clicks: list.reduce((s, p) => s + p.clicks, 0),
        purchases: list.reduce((s, p) => s + p.purchases, 0),
        engagementRate: ratio(engagement, impressions),
        avgImpressions: Math.round(impressions / list.length),
      };
    })
    .sort((a, b) => b.engagementRate - a.engagementRate);
}

export const summaryByFormat = (posts: SocialPost[]) => summarize(posts, (p) => p.format, (k) => FORMAT_LABEL[k as PostFormat] ?? k);
export const summaryByPlatform = (posts: SocialPost[]) =>
  summarize(posts, (p) => p.platform, (k) => PLATFORM_META[k as SocialPlatform]?.label ?? k);

export function countEvents(events: TrackEvent[]) {
  const out = { qr_scan: 0, page_view: 0, chat_open: 0, marketplace_click: 0 };
  for (const e of events) out[e.type] += 1;
  return out;
}

/** Compact, aggregated snapshot sent to the AI advisor (never raw rows). Purchases come from the online shop only. */
export function advisorSnapshot(metrics: SocialMetric[], posts: SocialPost[], filters: Filters) {
  const social = metrics.filter((m) => isSocial(m.platform));
  const socialPosts = posts.filter((x) => isSocial(x.platform));
  const shop = totals(metrics.filter((m) => m.platform === "shopee"));
  const perPlatform = SOCIAL_MEDIA.map((p) => {
    const t = totals(social.filter((m) => m.platform === p));
    return {
      platform: PLATFORM_META[p].label,
      impressions: t.impressions,
      engagementRate: +ratio(t.engagement, t.impressions).toFixed(4),
      profileVisitRate: +ratio(t.profileVisits, t.engagement).toFixed(4),
      clickRate: +ratio(t.marketplaceClicks, t.profileVisits).toFixed(4),
    };
  }).filter((p) => p.impressions > 0);
  const all = totals(social);
  return {
    periodDays: filters.days,
    platformFilter: filters.platform,
    totals: {
      impressions: all.impressions,
      engagement: all.engagement,
      profileVisits: all.profileVisits,
      marketplaceClicks: all.marketplaceClicks,
    },
    onlineShop: {
      platform: "Shopee",
      marketplaceClicks: shop.marketplaceClicks,
      purchases: shop.purchases,
      conversion: +ratio(shop.purchases, shop.marketplaceClicks).toFixed(4),
    },
    funnel: funnel({ ...all, purchases: shop.purchases }).map((st) => ({
      stage: st.label,
      value: st.value,
      conversionFromPrev: st.fromPrev && +st.fromPrev.toFixed(4),
    })),
    perPlatform,
    byFormat: summaryByFormat(socialPosts).map((g) => ({
      format: g.label,
      posts: g.posts,
      engagementRate: +g.engagementRate.toFixed(4),
      avgImpressions: g.avgImpressions,
      clicks: g.clicks,
    })),
    topPosts: topContent(socialPosts, "engagement", 3).map((x) => ({
      title: x.title,
      platform: PLATFORM_META[x.platform].label,
      format: FORMAT_LABEL[x.format],
      engagement: postEngagement(x),
      clicks: x.clicks,
    })),
  };
}

export type AdvisorSnapshot = ReturnType<typeof advisorSnapshot>;
