import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { loadWindow } from "@/lib/dashboard-data";
import {
  FORMAT_LABEL,
  funnel,
  parseFilters,
  PLATFORM_META,
  postEngagement,
  ratio,
  totals,
  type FunnelStage,
} from "@/lib/analytics";
import { DATE, DATETIME, NUM, PCT, sheet, workbook, type SheetSpec } from "@/lib/xlsx";
import type { ContentPlan, InsightTopic, SocialMetric, SocialPost } from "@/types";

const DATASETS = ["metrics", "posts", "funnel", "insights", "content", "all"] as const;
type Dataset = (typeof DATASETS)[number];

const STATUS_LABEL: Record<ContentPlan["status"], string> = { idea: "Ide", draft: "Draft", scheduled: "Terjadwal", posted: "Terposting" };

// Excel has no timezone; shift to WIB so times read as local.
const wib = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000);

export async function GET(req: Request, ctx: RouteContext<"/api/export/[dataset]">) {
  const denied = await requireApiSession();
  if (denied) return denied;

  const { dataset } = await ctx.params;
  if (!(DATASETS as readonly string[]).includes(dataset)) {
    return Response.json({ error: "Dataset tidak dikenal." }, { status: 404 });
  }
  const ds = dataset as Dataset;
  const filters = parseFilters(Object.fromEntries(new URL(req.url).searchParams));
  const scope = `${filters.days} hari terakhir, ${filters.platform === "all" ? "semua platform" : PLATFORM_META[filters.platform].label}`;
  const db = getDb();
  const specs: SheetSpec[] = [];
  const want = (d: Dataset) => ds === d || ds === "all";

  if (want("metrics") || want("posts") || want("funnel")) {
    const { metrics, posts } = await loadWindow(filters);

    if (want("funnel")) {
      specs.push(
        sheet<FunnelStage>("Funnel", [
          { header: "Tahap", value: (s) => s.label, width: 20 },
          { header: "Jumlah", value: (s) => s.value, format: NUM, width: 14 },
          { header: "Konversi dari tahap sebelumnya", value: (s) => s.fromPrev, format: PCT, width: 30 },
          { header: "Konversi dari impression", value: (s) => s.fromTop, format: PCT, width: 26 },
        ], funnel(totals(metrics)), `Customer Journey Funnel - ${scope}`),
      );
    }
    if (want("metrics")) {
      const rows = [...metrics].sort((a, b) => a.date.localeCompare(b.date) || a.platform.localeCompare(b.platform));
      specs.push(
        sheet<SocialMetric>("Metrik Harian", [
          { header: "Tanggal", value: (m) => new Date(`${m.date}T00:00:00Z`), format: DATE, width: 12 },
          { header: "Platform", value: (m) => PLATFORM_META[m.platform].label, width: 12 },
          { header: "Impression", value: (m) => m.impressions, format: NUM, width: 13 },
          { header: "Engagement", value: (m) => m.engagement, format: NUM, width: 13 },
          { header: "Engagement Rate", value: (m) => ratio(m.engagement, m.impressions), format: PCT, width: 16 },
          { header: "Profile Visit", value: (m) => m.profileVisits, format: NUM, width: 13 },
          { header: "Klik Marketplace", value: (m) => m.marketplaceClicks, format: NUM, width: 16 },
          { header: "Purchase", value: (m) => m.purchases, format: NUM, width: 11 },
          { header: "Followers", value: (m) => m.followers, format: NUM, width: 12 },
        ], rows, `Metrik Sosial Harian - ${scope}`),
      );
    }
    if (want("posts")) {
      const rows = [...posts].sort((a, b) => postEngagement(b) - postEngagement(a));
      specs.push(
        sheet<SocialPost>("Konten", [
          { header: "Judul", value: (p) => p.title, width: 48 },
          { header: "Platform", value: (p) => PLATFORM_META[p.platform].label, width: 12 },
          { header: "Format", value: (p) => FORMAT_LABEL[p.format], width: 10 },
          { header: "Tanggal Posting", value: (p) => wib(p.postedAt), format: DATETIME, width: 17 },
          { header: "Impression", value: (p) => p.impressions, format: NUM, width: 12 },
          { header: "Likes", value: (p) => p.likes, format: NUM },
          { header: "Komentar", value: (p) => p.comments, format: NUM },
          { header: "Share", value: (p) => p.shares, format: NUM },
          { header: "Save", value: (p) => p.saves, format: NUM },
          { header: "Total Engagement", value: (p) => postEngagement(p), format: NUM, width: 16 },
          { header: "Engagement Rate", value: (p) => ratio(postEngagement(p), p.impressions), format: PCT, width: 16 },
          { header: "Klik", value: (p) => p.clicks, format: NUM },
          { header: "Purchase", value: (p) => p.purchases, format: NUM },
        ], rows, `Performa Konten - ${scope}`),
      );
    }
  }

  if (want("insights")) {
    const report = await db.getLatestInsightReport();
    const title = report
      ? `Insight Pertanyaan Pelanggan - ${report.totalMessages} pertanyaan - dibuat ${wib(report.createdAt).toISOString().slice(0, 16).replace("T", " ")} WIB`
      : "Insight Pertanyaan Pelanggan - belum ada ringkasan";
    specs.push(
      sheet<InsightTopic>("Insight Pelanggan", [
        { header: "Topik", value: (t) => t.topic, width: 28 },
        { header: "Jumlah", value: (t) => t.count, format: NUM, width: 10 },
        { header: "Porsi", value: (t) => ratio(t.count, report?.totalMessages ?? 0), format: PCT, width: 10 },
        { header: "Contoh Pertanyaan", value: (t) => t.examples.join(" | "), width: 70 },
        { header: "Aksi yang Disarankan", value: (t) => t.action, width: 60 },
      ], report?.topics ?? [], title),
    );
  }

  if (want("content")) {
    const plans = await db.listContentPlans();
    specs.push(
      sheet<ContentPlan>("Rencana Konten", [
        { header: "Jadwal (WIB)", value: (p) => wib(p.scheduledAt), format: DATETIME, width: 17 },
        { header: "Platform", value: (p) => (p.platform === "instagram" ? "Instagram" : "TikTok"), width: 11 },
        { header: "Format", value: (p) => p.format, width: 10 },
        { header: "Status", value: (p) => STATUS_LABEL[p.status], width: 11 },
        { header: "Judul", value: (p) => p.title, width: 44 },
        { header: "Caption", value: (p) => p.caption, width: 60 },
        { header: "Produk", value: (p) => p.productCode ?? "", width: 11 },
        { header: "Dibuat AI", value: (p) => (p.createdByAi ? "Ya" : "Tidak"), width: 10 },
      ], plans, "Rencana Konten Instagram & TikTok"),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const buf = workbook(specs);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="astoetik-${ds}-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
