import { z } from "zod";
import { requireApiSession } from "@/lib/auth/session";
import { isGeminiEnabled } from "@/lib/env";
import { advisorSnapshot, parseFilters } from "@/lib/analytics";
import { loadWindow } from "@/lib/dashboard-data";
import { streamChat, withFallback } from "@/lib/ai/gemini";
import { ADVISOR_CHAT_SYSTEM } from "@/lib/ai/prompts";
import { mockAdvisorChat } from "@/lib/ai/mock-ai";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const MAX_MESSAGE_LENGTH = 500;

const bodySchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(8)
    .default([]),
  days: z.union([z.string(), z.number()]).optional(),
});

// Strip control chars; the length cap is enforced by the schema.
function sanitize(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

async function* mockStream(answer: string): AsyncGenerator<string> {
  // Word by word so the streaming UI path is exercised in demo mode.
  for (const word of answer.split(/(\s+)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 10));
  }
}

function textStream(gen: AsyncGenerator<string>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await gen.next();
        if (done) return controller.close();
        controller.enqueue(encoder.encode(value));
      } catch (err) {
        console.error("[advisor-chat] stream failed", err);
        controller.enqueue(encoder.encode("\n\nMaaf, AI Advisor sedang gangguan. Coba lagi sebentar lagi."));
        controller.close();
      }
    },
  });
}

export async function POST(req: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;

  const limit = rateLimit(`advisor-chat:${clientIp(req)}`, 30, 10 * 60 * 1000);
  if (!limit.ok) {
    return Response.json(
      { error: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: `Pesan tidak valid (maks ${MAX_MESSAGE_LENGTH} karakter).` }, { status: 400 });
  }
  const message = sanitize(parsed.data.message);
  if (!message) return Response.json({ error: "Pesan kosong." }, { status: 400 });

  // All platforms: the advisor compares social media and the online shop, so the dashboard's platform filter is not applied.
  const filters = parseFilters({ days: String(parsed.data.days ?? 30), platform: "all" });
  const { metrics, posts } = await loadWindow(filters);
  const snapshot = advisorSnapshot(metrics, posts, filters);

  const local = () => mockStream(mockAdvisorChat(snapshot, message));
  const gen = isGeminiEnabled
    ? withFallback(
        streamChat({
        system: `${ADVISOR_CHAT_SYSTEM}\n\nDATA AGREGAT (JSON):\n${JSON.stringify(snapshot)}`,
        history: parsed.data.history.map((h) => ({ role: h.role, content: sanitize(h.content) })),
        message,
      }),
        local,
      )
    : local();

  return new Response(textStream(gen), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Advisor-Mode": isGeminiEnabled ? "live" : "demo",
    },
  });
}
