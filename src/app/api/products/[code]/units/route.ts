import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { toUnit, unitCreateSchema } from "./schema";

export async function POST(req: Request, ctx: RouteContext<"/api/products/[code]/units">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { code } = await ctx.params;
  const parsed = unitCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(code));
  if (!product) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const { serial, ...fields } = parsed.data;
  const unit = toUnit(product.code, serial, fields, new Date().toISOString());
  if (!(await db.createUnit(unit))) {
    return Response.json({ error: `Nomor seri ${serial} sudah dipakai untuk ${product.code}.` }, { status: 409 });
  }
  return Response.json({ unit }, { status: 201 });
}
