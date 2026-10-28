import { z } from "zod";
import { getDb } from "@/lib/db";
import { isGeminiEnabled } from "@/lib/env";
import { buildProductContext, chatSystemPrompt } from "@/lib/ai/prompts";
import { streamChat } from "@/lib/ai/gemini";
import { mockChatAnswer } from "@/lib/ai/mock-chat";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { MANUAL_EXCERPTS } from "@/data/manuals";

const MAX_MESSAGE_LENGTH = 500;

const bodySchema = z.object({
  sessionId: z.uuid(),
  productCode: z.string().min(1).max(20),
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(8)
    .default([]),
});

// Strip control chars; the length cap is enforced by the schema.
function sanitize(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

function textStream(gen: AsyncGenerator<string>, onDone: (full: string) => Promise<void>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let full = "";
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await gen.next();
        if (done) {
          controller.close();
          await onDone(full).catch((e) => console.error("[chat] save reply failed", e));
          return;
        }
        full += value;
        controller.enqueue(encoder.encode(value));
      } catch (err) {
        console.error("[chat] stream failed", err);
        const msg = "\n\nMaaf, asisten sedang gangguan. Silakan coba lagi atau hubungi CS via WhatsApp.";
        controller.enqueue(encoder.encode(msg));
        controller.close();
      }
    },
  });
}

async function* mockStream(answer: string): AsyncGenerator<string> {
  // Emit word-by-word so the UI streaming path is exercised in demo mode.
  for (const word of answer.split(/(\s+)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 12));
  }
}

export async function POST(req: Request) {
  const limit = rateLimit(`chat:${clientIp(req)}`, 20, 10 * 60 * 1000);
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
  const { sessionId, productCode, history } = parsed.data;
  const message = sanitize(parsed.data.message);
  if (!message) return Response.json({ error: "Pesan kosong." }, { status: 400 });

  const db = getDb();
  const product = await db.getProduct(productCode);
  if (!product) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  const faqs = await db.listFaqs(product.code);

  await db.ensureChatSession(sessionId, product.code);
  await db.addChatMessage({ sessionId, productCode: product.code, role: "user", content: message });

  const gen = isGeminiEnabled
    ? streamChat({
        system: chatSystemPrompt(buildProductContext(product, faqs, MANUAL_EXCERPTS[product.code])),
        history: history.map((h) => ({ role: h.role, content: sanitize(h.content) })),
        message,
      })
    : mockStream(mockChatAnswer(product, faqs, message));

  const stream = textStream(gen, async (full) => {
    if (full.trim()) {
      await db.addChatMessage({ sessionId, productCode: product.code, role: "assistant", content: full.trim() });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Astera-Mode": isGeminiEnabled ? "live" : "demo",
    },
  });
}
