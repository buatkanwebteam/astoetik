import { requireApiSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { planInputSchema } from "./schema";

export async function GET() {
  const denied = await requireApiSession();
  if (denied) return denied;
  return Response.json({ plans: await getDb().listContentPlans() });
}

export async function POST(req: Request) {
  const denied = await requireApiSession();
  if (denied) return denied;
  const parsed = planInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  const [plan] = await getDb().createContentPlans([{ ...parsed.data, createdByAi: false }]);
  return Response.json({ plan }, { status: 201 });
}
