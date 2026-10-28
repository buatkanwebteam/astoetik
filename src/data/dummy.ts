import type { PostFormat, SocialMetric, SocialPlatform, SocialPost } from "../types";

// Deterministic dummy analytics. Same seed => same numbers; dates are anchored
// to the given end date so the dashboard always shows "recent" data.

export const DUMMY_DAYS = 90;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlatformProfile {
  baseImpressions: number;
  engagementRate: number;
  visitRate: number; // profile visits / engagement
  clickRate: number; // marketplace clicks / profile visits
  purchaseRate: number; // purchases / clicks
  baseFollowers: number;
  followerGain: number; // per 1000 impressions
}

const PROFILES: Record<SocialPlatform, PlatformProfile> = {
  tiktok: { baseImpressions: 9000, engagementRate: 0.068, visitRate: 0.18, clickRate: 0.22, purchaseRate: 0.07, baseFollowers: 12400, followerGain: 1.6 },
  instagram: { baseImpressions: 5200, engagementRate: 0.052, visitRate: 0.26, clickRate: 0.2, purchaseRate: 0.08, baseFollowers: 8600, followerGain: 1.1 },
  shopee: { baseImpressions: 3100, engagementRate: 0.035, visitRate: 0.55, clickRate: 0.34, purchaseRate: 0.12, baseFollowers: 3100, followerGain: 0.7 },
  youtube: { baseImpressions: 1600, engagementRate: 0.041, visitRate: 0.14, clickRate: 0.18, purchaseRate: 0.06, baseFollowers: 1900, followerGain: 0.9 },
};

const PLATFORM_SEED: Record<SocialPlatform, number> = { tiktok: 11, instagram: 23, shopee: 37, youtube: 41 };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Two campaign spikes: a viral tutorial (day 35) and a 10.10-style promo (day 70).
function spike(day: number): number {
  const s1 = day >= 35 && day < 39 ? 2.4 / (1 + (day - 35) * 0.6) : 1;
  const s2 = day >= 70 && day < 73 ? 1.9 / (1 + (day - 70) * 0.5) : 1;
  return Math.max(1, s1) * Math.max(1, s2);
}

function weekly(date: Date): number {
  const dow = date.getUTCDay();
  if (dow === 0 || dow === 6) return 1.15;
  if (dow === 1) return 0.92;
  return 1;
}

export function generateSocialMetrics(endDate: Date = new Date()): SocialMetric[] {
  const end = startOfUtcDay(endDate);
  const out: SocialMetric[] = [];
  for (const platform of Object.keys(PROFILES) as SocialPlatform[]) {
    const p = PROFILES[platform];
    const rand = mulberry32(PLATFORM_SEED[platform] * 1000 + 7);
    let followers = p.baseFollowers;
    for (let day = 0; day < DUMMY_DAYS; day++) {
      const date = new Date(end);
      date.setUTCDate(end.getUTCDate() - (DUMMY_DAYS - 1 - day));
      const trend = 1 + (0.6 * day) / DUMMY_DAYS;
      const noise = 0.88 + rand() * 0.24;
      const impressions = Math.round(p.baseImpressions * trend * weekly(date) * spike(day) * noise);
      const engagement = Math.round(impressions * p.engagementRate * (0.9 + rand() * 0.2));
      const profileVisits = Math.max(1, Math.round(engagement * p.visitRate * (0.9 + rand() * 0.2)));
      const marketplaceClicks = Math.max(1, Math.min(profileVisits - 1, Math.round(profileVisits * p.clickRate * (0.85 + rand() * 0.3))));
      const purchases = Math.max(0, Math.min(marketplaceClicks - 1, Math.round(marketplaceClicks * p.purchaseRate * (0.7 + rand() * 0.6))));
      followers += Math.round((impressions / 1000) * p.followerGain);
      out.push({
        id: `${platform}-${isoDate(date)}`,
        platform,
        date: isoDate(date),
        impressions,
        engagement,
        profileVisits,
        marketplaceClicks,
        purchases,
        followers,
      });
    }
  }
  return out;
}

const POST_TOPICS: { title: string; platform: SocialPlatform; format: PostFormat; weight: number }[] = [
  { title: "Tutorial canting listrik untuk pemula", platform: "tiktok", format: "video", weight: 1.6 },
  { title: "Cara isi malam ke nyamplung canting listrik", platform: "instagram", format: "reel", weight: 1.3 },
  { title: "Perbandingan kompor SNI vs non-SNI", platform: "youtube", format: "video", weight: 1.1 },
  { title: "Behind the scenes produksi kompor tanah liat", platform: "instagram", format: "carousel", weight: 0.9 },
  { title: "Testimoni pembatik Bantul pakai kompor listrik", platform: "tiktok", format: "video", weight: 1.4 },
  { title: "Promo 10.10 kompor batik listrik", platform: "shopee", format: "live", weight: 1.5 },
  { title: "5 tips merawat canting listrik", platform: "instagram", format: "carousel", weight: 1.0 },
  { title: "Kompor cap besi untuk batik cap", platform: "youtube", format: "video", weight: 0.8 },
  { title: "Live demo membatik dengan canting 3in1", platform: "tiktok", format: "live", weight: 1.2 },
  { title: "Hemat listrik: kompor 150 W vs 300 W", platform: "tiktok", format: "video", weight: 1.3 },
  { title: "Behind the scenes uji TKDN produk", platform: "instagram", format: "reel", weight: 0.8 },
  { title: "Unboxing kompor batik listrik SNI New", platform: "youtube", format: "video", weight: 1.0 },
  { title: "Testimoni sanggar batik sekolah", platform: "instagram", format: "reel", weight: 1.1 },
  { title: "Flash sale canting portabel", platform: "shopee", format: "video", weight: 1.2 },
  { title: "Kenapa malam tidak mencair? Ini solusinya", platform: "tiktok", format: "video", weight: 1.5 },
  { title: "Galeri motif karya pelanggan", platform: "instagram", format: "carousel", weight: 0.9 },
  { title: "Live Q&A kompor batik bersama tim Astoetik", platform: "instagram", format: "live", weight: 0.7 },
  { title: "Proses finishing gagang kayu canting", platform: "tiktok", format: "video", weight: 1.0 },
  { title: "Perbandingan canting tembaga vs canting listrik", platform: "youtube", format: "video", weight: 1.2 },
  { title: "Promo gajian bundling kompor + canting", platform: "shopee", format: "live", weight: 1.3 },
];

const FORMAT_FACTOR: Record<PostFormat, { reach: number; save: number; click: number }> = {
  reel: { reach: 1.3, save: 1.0, click: 1.0 },
  carousel: { reach: 0.8, save: 1.8, click: 0.9 },
  video: { reach: 1.1, save: 0.9, click: 1.1 },
  live: { reach: 0.7, save: 0.4, click: 1.7 },
};

const PLATFORM_REACH: Record<SocialPlatform, number> = { tiktok: 1.6, instagram: 1.0, shopee: 0.7, youtube: 0.8 };

export function generateSocialPosts(endDate: Date = new Date(), count = 40): SocialPost[] {
  const end = startOfUtcDay(endDate);
  const rand = mulberry32(2024);
  const posts: SocialPost[] = [];
  for (let i = 0; i < count; i++) {
    const t = POST_TOPICS[i % POST_TOPICS.length];
    const round = Math.floor(i / POST_TOPICS.length);
    const daysAgo = Math.floor(((count - 1 - i) / count) * (DUMMY_DAYS - 2)) + 1;
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - daysAgo);
    date.setUTCHours(11 + Math.floor(rand() * 8), Math.floor(rand() * 60));
    const f = FORMAT_FACTOR[t.format];
    const impressions = Math.round(18000 * PLATFORM_REACH[t.platform] * f.reach * t.weight * (0.6 + rand() * 0.9));
    const likes = Math.round(impressions * (0.035 + rand() * 0.03));
    const comments = Math.round(likes * (0.05 + rand() * 0.08));
    const shares = Math.round(likes * (0.04 + rand() * 0.08));
    const saves = Math.round(likes * 0.1 * f.save * (0.6 + rand() * 0.8));
    const clicks = Math.round(impressions * 0.006 * f.click * (0.6 + rand() * 0.8));
    const purchases = Math.round(clicks * (0.05 + rand() * 0.08));
    posts.push({
      id: `post-${String(i + 1).padStart(2, "0")}`,
      platform: t.platform,
      title: round > 0 ? `${t.title} (bagian ${round + 1})` : t.title,
      postedAt: date.toISOString(),
      format: t.format,
      impressions,
      likes,
      comments,
      shares,
      saves,
      clicks,
      purchases,
    });
  }
  return posts;
}
