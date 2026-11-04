import { revalidatePath } from "next/cache";
import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { productCreateSchema, toProduct } from "./schema";

export async function POST(req: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const parsed = productCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });

  const { code, ...fields } = parsed.data;
  const product = toProduct(code, fields, [fields.image], null);
  if (!(await getDb().createProduct(product))) {
    return Response.json({ error: `Kode ${code} sudah dipakai produk lain.` }, { status: 409 });
  }
  revalidatePath("/");
  return Response.json({ product }, { status: 201 });
}
