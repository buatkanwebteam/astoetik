import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { toUnit, unitFieldsSchema } from "../schema";

// The serial is printed inside the unit's QR, so it is never editable.

async function findUnit(ctx: RouteContext<"/api/products/[code]/units/[serial]">) {
  const { code, serial } = await ctx.params;
  const db = getDb();
  const product = await db.getProduct(decodeURIComponent(code));
  const unit = product ? await db.getUnit(product.code, decodeURIComponent(serial)) : null;
  return { db, unit };
}

export async function PATCH(req: Request, ctx: RouteContext<"/api/products/[code]/units/[serial]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const parsed = unitFieldsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const { db, unit } = await findUnit(ctx);
  if (!unit) return Response.json({ error: "Unit tidak ditemukan." }, { status: 404 });
  const next = toUnit(unit.productCode, unit.serial, parsed.data, unit.createdAt);
  if (!(await db.updateUnit(next))) return Response.json({ error: "Unit tidak ditemukan." }, { status: 404 });
  return Response.json({ unit: next });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/products/[code]/units/[serial]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { db, unit } = await findUnit(ctx);
  if (!unit) return Response.json({ error: "Unit tidak ditemukan." }, { status: 404 });
  await db.deleteUnit(unit.productCode, unit.serial);
  return new Response(null, { status: 204 });
}
