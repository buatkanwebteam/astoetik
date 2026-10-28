"use client";

import { useState } from "react";
import { Lightbulb, Loader2, MessageSquareQuote, Sparkles } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { InsightReport } from "@/types";
import { formatDateTime } from "@/lib/format";
import { Card, CardTitle, ExportLink } from "./ui";

const BAR_COLORS = ["#6b3f1d", "#8c5a2f", "#ae7646", "#c8923b", "#d9a95a", "#e2c4a3", "#57321a", "#cd9e72"];

export function InsightsPanel({ initialReport, messageCount }: { initialReport: InsightReport | null; messageCount: number }) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function summarize() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = (await res.json()) as { report?: InsightReport; error?: string };
      if (!res.ok || !data.report) throw new Error(data.error ?? "Gagal meringkas.");
      setReport(data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = report?.topics.map((t) => ({ topic: t.topic, count: t.count })) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm">
              <strong className="font-display text-2xl">{messageCount}</strong> pertanyaan pelanggan dalam 30 hari terakhir.
            </p>
            <p className="text-xs text-ink-soft dark:text-krem/60">
              {report
                ? `Ringkasan terakhir: ${formatDateTime(report.createdAt)} dari ${report.totalMessages} pertanyaan${report.demo ? " (Mode Demo)" : ""}.`
                : "Belum ada ringkasan. Tekan Ringkas untuk mengelompokkan pertanyaan."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report && <ExportLink href="/api/export/insights" />}
            <button
              type="button"
              onClick={summarize}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-tanah-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-emas dark:text-tanah-900"
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
              Ringkas
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </Card>

      {report && report.topics.length > 0 && (
        <>
          <Card>
            <CardTitle>Distribusi topik</CardTitle>
            <div className="w-full" style={{ height: Math.max(160, chartData.length * 44) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <XAxis type="number" allowDecimals={false} stroke="#ae7646" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="topic" width={170} stroke="#ae7646" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v} pertanyaan`, "Jumlah"]}
                    contentStyle={{ background: "#fffaf3", border: "1px solid #e2c4a3", borderRadius: 12, fontSize: 12, color: "#2b1d12" }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="#c8923b" label={{ position: "right", fontSize: 11, fill: "#8c5a2f" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {report.topics.map((t, i) => (
              <li key={t.topic}>
                <Card className="h-full">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg leading-snug">{t.topic}</h3>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ background: BAR_COLORS[i % BAR_COLORS.length], color: i % BAR_COLORS.length >= 3 && i % BAR_COLORS.length <= 5 ? "#2a190e" : "#fff" }}
                    >
                      {t.count}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {t.examples.map((ex) => (
                      <li key={ex} className="flex gap-1.5 text-sm text-ink-soft dark:text-krem/75">
                        <MessageSquareQuote className="mt-0.5 size-3.5 shrink-0 text-tanah-300" aria-hidden />
                        <span>&ldquo;{ex}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex gap-1.5 rounded-lg bg-emas-soft/50 p-2.5 text-sm text-tanah-900 dark:bg-emas/15 dark:text-emas-soft">
                    <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {t.action}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
