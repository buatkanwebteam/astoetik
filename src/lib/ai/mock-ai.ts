import type { ChatMessage, Product } from "@/types";
import type { AdvisorSnapshot } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";
import type { AdvisorResult, ContentIdeas, InsightsResult } from "./schemas";

// Deterministic stand-ins for Gemini when GEMINI_API_KEY is absent. They read
// the same inputs as the real prompts so the UI behaves realistically.

export function mockAdvisor(s: AdvisorSnapshot): AdvisorResult {
  const plats = [...s.perPlatform];
  const byEr = [...plats].sort((a, b) => b.engagementRate - a.engagementRate);
  const byClick = [...plats].sort((a, b) => a.clickRate - b.clickRate);
  const byBuy = [...plats].sort((a, b) => b.purchaseRate - a.purchaseRate);
  const formats = [...s.byFormat].sort((a, b) => b.engagementRate - a.engagementRate);
  const top = s.topPosts[0];
  const er = s.totals.impressions ? s.totals.engagement / s.totals.impressions : 0;

  const recs: AdvisorResult["recommendations"] = [];
  if (byEr[0]) {
    recs.push({
      priority: 1,
      title: `Gandakan konten di ${byEr[0].platform}`,
      platform: byEr[0].platform,
      reason: `${byEr[0].platform} punya engagement rate tertinggi (${formatPercent(byEr[0].engagementRate, 2)}) dengan ${formatNumber(byEr[0].impressions)} impression.`,
      action: "Tambah 2 posting per minggu di platform ini dan pakai ulang hook dari konten terbaik.",
    });
  }
  if (byClick[0]) {
    recs.push({
      priority: 2,
      title: `Perbaiki jalur ke marketplace di ${byClick[0].platform}`,
      platform: byClick[0].platform,
      reason: `Rasio klik marketplace dari profile visit di ${byClick[0].platform} paling rendah (${formatPercent(byClick[0].clickRate)}).`,
      action: "Pasang link produk langsung di bio/etalase dan tambahkan CTA \"cek link di bio\" di 3 detik terakhir video.",
    });
  }
  if (formats[0]) {
    recs.push({
      priority: 3,
      title: `Prioritaskan format ${formats[0].format}`,
      platform: "Semua",
      reason: `Format ${formats[0].format} mencatat engagement rate ${formatPercent(formats[0].engagementRate, 2)} dari ${formats[0].posts} konten.`,
      action: `Jadwalkan minimal 3 konten ${formats[0].format} pekan ini, fokus tutorial canting dan kompor.`,
    });
  }
  if (top) {
    recs.push({
      priority: 4,
      title: "Buat seri lanjutan konten terbaik",
      platform: top.platform,
      reason: `"${top.title}" menghasilkan ${formatNumber(top.engagement)} engagement dan ${formatNumber(top.purchases)} purchase.`,
      action: "Buat bagian 2 dengan sudut berbeda (kesalahan umum pemula) dan sematkan di profil.",
    });
  }
  if (byBuy[0]) {
    recs.push({
      priority: 5,
      title: `Manfaatkan konversi tinggi ${byBuy[0].platform}`,
      platform: byBuy[0].platform,
      reason: `${byBuy[0].platform} mengubah ${formatPercent(byBuy[0].purchaseRate)} klik menjadi purchase, tertinggi di antara platform.`,
      action: "Arahkan traffic dari konten lain ke toko ini dan siapkan voucher khusus follower.",
    });
  }

  return {
    summary: `Dalam ${s.periodDays} hari terakhir tercatat ${formatNumber(s.totals.impressions)} impression dengan engagement rate ${formatPercent(er, 2)} dan ${formatNumber(s.totals.purchases)} purchase. Funnel terbesar bocor di tahap engagement ke profile visit.`,
    recommendations: recs.slice(0, 5),
  };
}

const IDEA_BANK: Omit<ContentIdeas["ideas"][number], "dayOfMonth" | "hour">[] = [
  { platform: "tiktok", title: "3 kesalahan pemula saat mencanting", caption: "Sering malam meluber? Ini 3 kesalahan yang paling sering terjadi dan cara menghindarinya.", format: "video", productCode: "K-CL001" },
  { platform: "instagram", title: "Carousel: memilih kompor batik sesuai kebutuhan", caption: "Pemula, sanggar, atau produksi? Geser untuk tahu kompor yang cocok.", format: "carousel", productCode: null },
  { platform: "tiktok", title: "ASMR malam mencair di kompor tanah liat", caption: "Suara malam mencair yang bikin tenang. Siapa yang suka?", format: "video", productCode: "T-SD001" },
  { platform: "instagram", title: "Reels: sehari di workshop Astoetik Bantul", caption: "Dari perakitan sampai uji kualitas, begini proses di balik kompor batik listrik kami.", format: "reel", productCode: null },
  { platform: "tiktok", title: "Canting 3in1: cecek, klowong, tembokan", caption: "Satu canting, tiga cucuk. Lihat bedanya di kain!", format: "video", productCode: "K-CL002" },
  { platform: "instagram", title: "Tips aman memakai alat batik listrik", caption: "Simpan postingan ini sebelum mulai membatik.", format: "carousel", productCode: null },
  { platform: "tiktok", title: "Live: tanya jawab kompor SNI", caption: "Live malam ini bahas kompor batik listrik SNI. Siapkan pertanyaanmu!", format: "live", productCode: "A-SD003N" },
  { platform: "instagram", title: "Karya pelanggan minggu ini", caption: "Repost karya terbaik pelanggan yang memakai alat Astoetik. Tag kami untuk ditampilkan!", format: "carousel", productCode: null },
  { platform: "tiktok", title: "Canting portabel untuk membatik di luar ruangan", caption: "Membatik di teras atau di workshop tanpa colokan? Canting portabel jawabannya.", format: "video", productCode: "K-CL003" },
  { platform: "instagram", title: "Story poll: motif favorit bulan ini", caption: "Kawung, parang, atau truntum? Pilih favoritmu!", format: "story", productCode: null },
];

export function mockContentIdeas(opts: { platforms: ("instagram" | "tiktok")[]; count: number; seed: number; products: Product[] }): ContentIdeas {
  const codes = new Set(opts.products.map((p) => p.code));
  const pool = IDEA_BANK.filter((i) => opts.platforms.includes(i.platform));
  const ideas = Array.from({ length: Math.min(opts.count, pool.length) }, (_, i) => {
    const base = pool[(i + opts.seed) % pool.length];
    return {
      ...base,
      productCode: base.productCode && codes.has(base.productCode) ? base.productCode : null,
      dayOfMonth: ((i * 4 + opts.seed) % 27) + 1,
      hour: [12, 19, 20][i % 3],
    };
  });
  return { ideas };
}

const TOPIC_RULES: { topic: string; re: RegExp; action: string }[] = [
  { topic: "Harga & promo", re: /(harga|promo|diskon|murah|biaya|cicil)/i, action: "Tampilkan harga katalog dan info promo aktif di halaman produk." },
  { topic: "Stok, garansi & pengiriman", re: /(stok|garansi|kirim|ongkir|ready|cod)/i, action: "Tambah FAQ stok/garansi dan cantumkan nomor CS di kartu garansi." },
  { topic: "Perawatan & kebersihan", re: /(bersih|rawat|cuci|kerak|sisa)/i, action: "Tambah FAQ perawatan dan konten carousel tips membersihkan." },
  { topic: "Masalah & perbaikan", re: /(rusak|tidak panas|gak panas|mati|error|lampu|perbaik|servis)/i, action: "Perjelas panduan troubleshooting dan alur klaim servis." },
  { topic: "Spesifikasi & listrik", re: /(daya|watt|volt|tegangan|listrik|bahan|ukuran|tinggi|diameter|berat|sni|tkdn)/i, action: "Tonjolkan tabel spesifikasi (daya, tegangan) di bagian atas halaman." },
  { topic: "Cara pakai", re: /(cara|pakai|nyala|guna|isi|malam|lilin|suhu|atur)/i, action: "Buat video tutorial singkat dan tautkan dari FAQ produk." },
];

export function mockInsights(messages: Pick<ChatMessage, "content">[]): InsightsResult {
  const buckets = new Map<string, number[]>();
  messages.forEach((m, i) => {
    const rule = TOPIC_RULES.find((r) => r.re.test(m.content));
    const key = rule?.topic ?? "Lainnya";
    buckets.set(key, [...(buckets.get(key) ?? []), i]);
  });
  const topics = [...buckets.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([topic, idx]) => ({
      topic,
      messageIndexes: idx,
      examples: [...new Set(idx.map((i) => messages[i].content))].slice(0, 3),
      action: TOPIC_RULES.find((r) => r.topic === topic)?.action ?? "Tinjau pertanyaan ini dan pertimbangkan menambah FAQ baru.",
    }));
  return { topics };
}
