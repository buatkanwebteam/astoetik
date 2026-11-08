import { requireApiSession } from "@/lib/auth/session";
import { isGeminiEnabled } from "@/lib/env";
import { getDb } from "@/lib/db";
import { generateJson } from "@/lib/ai/gemini";
import { insightsSchema, type InsightsResult } from "@/lib/ai/schemas";
import { INSIGHTS_SYSTEM } from "@/lib/ai/prompts";
import { mockInsights } from "@/lib/ai/mock-ai";
import type { InsightTopic } from "@/types";

const MAX_MESSAGES = 300;
const WINDOW_DAYS = 30;

export async function GET() {
  const denied = await requireApiSession();
  if (denied) return denied;
  return Response.json({ report: await getDb().getLatestInsightReport() });
}

export async function POST() {
  const denied = await requireApiSession();
  if (denied) return denied;

  const db = getDb();
  const since = new Date(Date.now() - WINDOW_DAYS * 864e5).toISOString();
  const messages = await db.listUserMessages(since, MAX_MESSAGES);
  if (messages.length === 0) {
    return Response.json({ error: "Belum ada pertanyaan pelanggan dalam 30 hari terakhir. Coba kirim pertanyaan lewat chatbot di halaman produk." }, { status: 404 });
  }

  let result: InsightsResult;
  let demo = !isGeminiEnabled;
  if (!isGeminiEnabled) {
    result = mockInsights(messages);
  } else {
    const list = messages.map((m, i) => `[${i}] (${m.productCode}) ${m.content.replace(/\s+/g, " ").slice(0, 300)}`).join("\n");
    try {
      result = await generateJson(insightsSchema, {
        system: INSIGHTS_SYSTEM,
        prompt: `Ada ${messages.length} pertanyaan pelanggan. Setiap indeks hanya boleh masuk satu topik.\n\n${list}`,
      });
    } catch {
      // Gemini unavailable: group the questions with the local keyword rules.
      result = mockInsights(messages);
      demo = true;
    }
  }

  // Count from indexes (not model-reported numbers) and assign each message one topic.
  const seen = new Set<number>();
  const updates: { id: string; topic: string }[] = [];
  const topics: InsightTopic[] = result.topics
    .map((t) => {
      const idx = t.messageIndexes.filter((i) => i < messages.length && !seen.has(i));
      idx.forEach((i) => {
        seen.add(i);
        updates.push({ id: messages[i].id, topic: t.topic });
      });
      return { topic: t.topic, count: idx.length, examples: t.examples.slice(0, 3), action: t.action };
    })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  await db.setMessageTopics(updates);
  const report = await db.saveInsightReport({ totalMessages: messages.length, topics, demo });
  return Response.json({ report });
}
