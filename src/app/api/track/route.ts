import { z } from "zod";
import { getDb } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  productCode: z.string().min(1).max(20),
  type: z.enum(["qr_scan", "page_view", "chat_open", "marketplace_click"]),
  meta: z.record(z.string().max(40), z.union([z.string().max(200), z.number(), z.boolean(), z.null()])).default({}),
});

export async function POST(req: Request) {
  if (!rateLimit(`track:${clientIp(req)}`, 120, 60 * 1000).ok) {
    return Response.json({ ok: false }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const db = getDb();
  const product = await db.getProduct(parsed.data.productCode);
  if (!product) return Response.json({ ok: false }, { status: 404 });

  await db.addEvent({ productCode: product.code, type: parsed.data.type, meta: parsed.data.meta });
  return Response.json({ ok: true });
}
