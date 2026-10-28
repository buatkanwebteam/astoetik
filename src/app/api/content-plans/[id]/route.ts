import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { planPatchSchema } from "../schema";

export async function PATCH(req: Request, ctx: RouteContext<"/api/content-plans/[id]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { id } = await ctx.params;
  const parsed = planPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  const plan = await getDb().updateContentPlan(id, parsed.data);
  if (!plan) return Response.json({ error: "Rencana konten tidak ditemukan." }, { status: 404 });
  return Response.json({ plan });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/content-plans/[id]">) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const { id } = await ctx.params;
  await getDb().deleteContentPlan(id);
  return new Response(null, { status: 204 });
}
