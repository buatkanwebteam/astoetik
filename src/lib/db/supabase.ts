import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ChatMessage,
  ContentPlan,
  ContentPlanInput,
  EventType,
  InsightReport,
  Product,
  ProductFaq,
  SocialMetric,
  SocialPost,
  TrackEvent,
} from "@/types";
import { env } from "@/lib/env";
import type { Db } from "./types";

// Server-side only, using the service role key. Auth for dashboard routes is
// enforced by proxy.ts + session cookie before any of these calls run.

type Row = Record<string, unknown>;

const str = (v: unknown) => (v == null ? "" : String(v));
const num = (v: unknown) => Number(v ?? 0);

function toProduct(r: Row): Product {
  const image = str(r.image);
  return {
    code: str(r.code),
    name: str(r.name),
    category: str(r.category) as Product["category"],
    price: num(r.price),
    specs: (r.specs as Product["specs"]) ?? [],
    tkdn: (r.tkdn as string | null) ?? null,
    sni: Boolean(r.sni),
    image,
    gallery: (r.gallery as string[] | null) ?? [image],
    marketplaceLinks: (r.marketplace_links as Product["marketplaceLinks"]) ?? {},
    note: (r.note as string | null) ?? null,
  };
}

function toFaq(r: Row): ProductFaq {
  return {
    id: str(r.id),
    productCode: str(r.product_code),
    question: str(r.question),
    answer: str(r.answer),
    source: str(r.source) as ProductFaq["source"],
  };
}

function toMessage(r: Row): ChatMessage {
  return {
    id: str(r.id),
    sessionId: str(r.session_id),
    productCode: str(r.product_code),
    role: str(r.role) as ChatMessage["role"],
    content: str(r.content),
    createdAt: str(r.created_at),
    topic: (r.topic as string | null) ?? null,
  };
}

function toPlan(r: Row): ContentPlan {
  return {
    id: str(r.id),
    platform: str(r.platform) as ContentPlan["platform"],
    title: str(r.title),
    caption: str(r.caption),
    format: str(r.format),
    scheduledAt: str(r.scheduled_at),
    status: str(r.status) as ContentPlan["status"],
    productCode: (r.product_code as string | null) ?? null,
    createdByAi: Boolean(r.created_by_ai),
  };
}

function fromPlan(p: Partial<ContentPlanInput>): Row {
  const row: Row = {};
  if (p.platform !== undefined) row.platform = p.platform;
  if (p.title !== undefined) row.title = p.title;
  if (p.caption !== undefined) row.caption = p.caption;
  if (p.format !== undefined) row.format = p.format;
  if (p.scheduledAt !== undefined) row.scheduled_at = p.scheduledAt;
  if (p.status !== undefined) row.status = p.status;
  if (p.productCode !== undefined) row.product_code = p.productCode;
  if (p.createdByAi !== undefined) row.created_by_ai = p.createdByAi;
  return row;
}

function check(res: { data: unknown; error: { message: string } | null }): unknown {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  client ??= createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function createSupabaseDb(): Db {
  return {
    mode: "supabase",

    async listProducts() {
      const rows = check(await sb().from("products").select("*").order("code"));
      return (rows as Row[]).map(toProduct);
    },
    async getProduct(code) {
      const rows = check(await sb().from("products").select("*").ilike("code", code).limit(1));
      const row = (rows as Row[])[0];
      return row ? toProduct(row) : null;
    },
    async listFaqs(productCode) {
      const rows = check(await sb().from("product_faqs").select("*").eq("product_code", productCode).order("id"));
      return (rows as Row[]).map(toFaq);
    },

    async ensureChatSession(sessionId, productCode) {
      check(
        await sb()
          .from("chat_sessions")
          .upsert({ id: sessionId, product_code: productCode }, { onConflict: "id", ignoreDuplicates: true }),
      );
    },
    async addChatMessage(msg) {
      const row = check(
        await sb()
          .from("chat_messages")
          .insert({ session_id: msg.sessionId, role: msg.role, content: msg.content })
          .select("*")
          .single(),
      );
      return toMessage({ ...(row as Row), product_code: msg.productCode });
    },
    async listUserMessages(sinceIso, limit) {
      const rows = check(
        await sb()
          .from("chat_messages")
          .select("*, chat_sessions(product_code)")
          .eq("role", "user")
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: false })
          .limit(limit),
      );
      return (rows as Row[])
        .map((r) => toMessage({ ...r, product_code: (r.chat_sessions as Row | null)?.product_code }))
        .reverse();
    },
    async setMessageTopics(updates) {
      // Group by topic so we issue one UPDATE per topic instead of per row.
      const byTopic = new Map<string, string[]>();
      for (const u of updates) byTopic.set(u.topic, [...(byTopic.get(u.topic) ?? []), u.id]);
      for (const [topic, ids] of byTopic) {
        check(await sb().from("chat_messages").update({ topic }).in("id", ids));
      }
    },

    async addEvent(event) {
      check(await sb().from("events").insert({ product_code: event.productCode, type: event.type, meta: event.meta }));
    },
    async listEvents(sinceIso) {
      const rows = check(await sb().from("events").select("*").gte("created_at", sinceIso).limit(10000));
      return (rows as Row[]).map(
        (r): TrackEvent => ({
          id: str(r.id),
          productCode: str(r.product_code),
          type: str(r.type) as EventType,
          meta: (r.meta as TrackEvent["meta"]) ?? {},
          createdAt: str(r.created_at),
        }),
      );
    },

    async listContentPlans() {
      const rows = check(await sb().from("content_plans").select("*").order("scheduled_at"));
      return (rows as Row[]).map(toPlan);
    },
    async createContentPlans(input) {
      const rows = check(await sb().from("content_plans").insert(input.map(fromPlan)).select("*"));
      return (rows as Row[]).map(toPlan);
    },
    async updateContentPlan(id, patch) {
      const rows = check(await sb().from("content_plans").update(fromPlan(patch)).eq("id", id).select("*"));
      const row = (rows as Row[])[0];
      return row ? toPlan(row) : null;
    },
    async deleteContentPlan(id) {
      check(await sb().from("content_plans").delete().eq("id", id));
    },

    async listSocialMetrics(sinceDate) {
      const rows = check(await sb().from("social_metrics").select("*").gte("date", sinceDate).order("date").limit(5000));
      return (rows as Row[]).map(
        (r): SocialMetric => ({
          id: str(r.id),
          platform: str(r.platform) as SocialMetric["platform"],
          date: str(r.date),
          impressions: num(r.impressions),
          engagement: num(r.engagement),
          profileVisits: num(r.profile_visits),
          marketplaceClicks: num(r.marketplace_clicks),
          purchases: num(r.purchases),
          followers: num(r.followers),
        }),
      );
    },
    async listSocialPosts(sinceIso) {
      const rows = check(await sb().from("social_posts").select("*").gte("posted_at", sinceIso).order("posted_at"));
      return (rows as Row[]).map(
        (r): SocialPost => ({
          id: str(r.id),
          platform: str(r.platform) as SocialPost["platform"],
          title: str(r.title),
          postedAt: str(r.posted_at),
          format: str(r.format) as SocialPost["format"],
          impressions: num(r.impressions),
          likes: num(r.likes),
          comments: num(r.comments),
          shares: num(r.shares),
          saves: num(r.saves),
          clicks: num(r.clicks),
          purchases: num(r.purchases),
        }),
      );
    },

    async saveInsightReport(report) {
      const row = check(
        await sb()
          .from("insight_reports")
          .insert({ total_messages: report.totalMessages, topics: report.topics, demo: report.demo })
          .select("*")
          .single(),
      ) as Row;
      return { ...report, id: str(row.id), createdAt: str(row.created_at) };
    },
    async getLatestInsightReport() {
      const rows = check(
        await sb().from("insight_reports").select("*").order("created_at", { ascending: false }).limit(1),
      );
      const r = (rows as Row[])[0];
      if (!r) return null;
      return {
        id: str(r.id),
        createdAt: str(r.created_at),
        totalMessages: num(r.total_messages),
        topics: (r.topics as InsightReport["topics"]) ?? [],
        demo: Boolean(r.demo),
      };
    },
  };
}
