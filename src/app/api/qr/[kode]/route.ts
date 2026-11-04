import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { qrPng } from "@/lib/qr";

/** QR for a product type, or for one unit with ?seri=<serial>. Add ?download to save as file. */
export async function GET(req: Request, ctx: RouteContext<"/api/qr/[kode]">) {
  const denied = await requireApiSession();
  if (denied) return denied;

  const { kode } = await ctx.params;
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(kode));
  if (!product) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const params = new URL(req.url).searchParams;
  const seri = params.get("seri");
  const unit = seri ? await db.getUnit(product.code, seri) : null;
  if (seri && !unit) return Response.json({ error: "Unit tidak ditemukan." }, { status: 404 });

  const png = await qrPng(product.code, unit?.serial);
  const name = unit ? `QR-${product.code}-${unit.serial}` : `QR-${product.code}`;
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
      ...(params.has("download") ? { "Content-Disposition": `attachment; filename="${name}.png"` } : {}),
    },
  });
}
