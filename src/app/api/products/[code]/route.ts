import { revalidatePath } from "next/cache";
import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { productFieldsSchema, toProduct } from "../schema";

// The code is the primary key and is printed inside QR labels, so it is never editable.

export async function PATCH(req: Request, ctx: RouteContext<"/api/products/[code]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { code } = await ctx.params;
  const parsed = productFieldsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const db = getDb();
  const existing = await db.getProduct(decodeURIComponent(code));
  if (!existing) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  // A new main photo replaces the first gallery slot; the other photos stay.
  const gallery = parsed.data.image === existing.image ? existing.gallery : [parsed.data.image, ...existing.gallery.slice(1)];
  const product = toProduct(existing.code, parsed.data, gallery, existing.tkdn);
  if (!(await db.updateProduct(product))) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  revalidatePath("/");
  return Response.json({ product });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/products/[code]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { code } = await ctx.params;
  const db = getDb();
  const existing = await db.getProduct(decodeURIComponent(code));
  if (!existing) return Response.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  await db.deleteProduct(existing.code);
  revalidatePath("/");
  return new Response(null, { status: 204 });
}
