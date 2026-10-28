import { requireApiSession } from "@/lib/auth/session";
import { isGeminiEnabled } from "@/lib/env";
import { advisorSnapshot, parseFilters } from "@/lib/analytics";
import { loadWindow } from "@/lib/dashboard-data";
import { AiError, generateJson } from "@/lib/ai/gemini";
import { advisorSchema } from "@/lib/ai/schemas";
import { ADVISOR_SYSTEM } from "@/lib/ai/prompts";
import { mockAdvisor } from "@/lib/ai/mock-ai";

export async function POST(req: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | undefined>;
  const filters = parseFilters(body);
  const { metrics, posts } = await loadWindow(filters);
  const snapshot = advisorSnapshot(metrics, posts, filters);

  if (!isGeminiEnabled) {
    return Response.json({ demo: true, result: mockAdvisor(snapshot) });
  }
  try {
    const result = await generateJson(advisorSchema, {
      system: ADVISOR_SYSTEM,
      prompt: `Berikut data agregat (JSON). Berikan ringkasan dan tepat 5 rekomendasi berprioritas (1 = paling penting), urut dari prioritas 1.\n\n${JSON.stringify(snapshot)}`,
    });
    result.recommendations.sort((a, b) => a.priority - b.priority);
    return Response.json({ demo: false, result });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Gagal memanggil AI.";
    return Response.json({ error: message }, { status: 502 });
  }
}
