import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { qrPng } from "@/lib/qr";

export async function GET(req: Request, ctx: RouteContext<"/api/qr/[kode]">) {
  const denied = await requireApiSession();
  if (denied) return denied;

  const { kode } = await ctx.params;
  const product = await getDb().getProduct(decodeURIComponent(kode));
  if (!product) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const png = await qrPng(product.code);
  const download = new URL(req.url).searchParams.has("download");
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
      ...(download ? { "Content-Disposition": `attachment; filename="QR-${product.code}.png"` } : {}),
    },
  });
}
