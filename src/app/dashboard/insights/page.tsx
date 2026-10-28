import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/ui";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";

export const metadata: Metadata = { title: "Insight Pelanggan" };

export default async function InsightsPage() {
  const db = getDb();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [report, messages] = await Promise.all([db.getLatestInsightReport(), db.listUserMessages(since, 300)]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Insight Pelanggan"
        subtitle="Ringkasan AI dari pertanyaan yang masuk lewat chatbot halaman produk (scan QR)."
      />
      <InsightsPanel initialReport={report} messageCount={messages.length} />
    </div>
  );
}
