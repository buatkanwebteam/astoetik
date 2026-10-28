import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { isGeminiEnabled } from "@/lib/env";
import { PageHeader } from "@/components/dashboard/ui";
import { ContentPlanner } from "@/components/dashboard/ContentPlanner";

export const metadata: Metadata = { title: "Content Planner" };

export default async function ContentPage() {
  const db = getDb();
  const [plans, products] = await Promise.all([db.listContentPlans(), db.listProducts()]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Content Planner" subtitle="Kalender konten Instagram & TikTok, plus ide konten dari AI." />
      <ContentPlanner
        initialPlans={plans}
        products={products.map((p) => ({ code: p.code, name: p.name }))}
        demo={!isGeminiEnabled}
      />
    </div>
  );
}
