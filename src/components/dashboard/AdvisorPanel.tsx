"use client";

import { useState } from "react";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import type { Filters } from "@/lib/analytics";
import type { AdvisorResult } from "@/lib/ai/schemas";
import { Card, CardTitle } from "./ui";

export function AdvisorPanel({ filters }: { filters: Filters }) {
  const [state, setState] = useState<{ result: AdvisorResult; demo: boolean; key: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = `${filters.days}-${filters.platform}`;
  const stale = state && state.key !== key;

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: String(filters.days), platform: filters.platform }),
      });
      const data = (await res.json()) as { result?: AdvisorResult; demo?: boolean; error?: string };
      if (!res.ok || !data.result) throw new Error(data.error ?? "Gagal memuat rekomendasi.");
      setState({ result: data.result, demo: Boolean(data.demo), key });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="batik-pattern-light pointer-events-none absolute inset-0 opacity-60 dark:opacity-20" aria-hidden />
      <div className="relative">
        <CardTitle
          action={
            <div className="flex items-center gap-2">
              {state?.demo && (
                <span className="rounded-full bg-emas-soft px-2 py-0.5 text-[11px] font-semibold text-tanah-800">Mode Demo</span>
              )}
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-tanah-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-tanah-700 disabled:opacity-60 dark:bg-emas dark:text-tanah-900"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
                {state ? "Analisis ulang" : "Minta rekomendasi"}
              </button>
            </div>
          }
        >
          AI Advisor
        </CardTitle>

        {error && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        {!state && !loading && !error && (
          <p className="text-sm text-ink-soft dark:text-krem/70">
            AI membaca agregat metrik periode terpilih (bukan data mentah) lalu memberi 5 rekomendasi berprioritas, lengkap dengan
            alasan berbasis angka dan aksi konkret.
          </p>
        )}

        {loading && !state && <p className="text-sm text-ink-soft dark:text-krem/70">Menganalisis data…</p>}

        {state && (
          <div aria-live="polite" className={loading ? "opacity-60" : ""}>
            {stale && (
              <p className="mb-3 text-xs text-tanah-600 dark:text-emas">Filter berubah. Klik &quot;Analisis ulang&quot; untuk memperbarui.</p>
            )}
            <p className="mb-4 rounded-xl bg-tanah-50 p-3 text-sm leading-relaxed dark:bg-white/5">{state.result.summary}</p>
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {state.result.recommendations.map((r) => (
                <li key={`${r.priority}-${r.title}`} className="rounded-xl border border-tanah-900/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-emas text-xs font-bold text-tanah-900">{r.priority}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft dark:text-krem/60">{r.platform}</span>
                  </div>
                  <h3 className="font-semibold leading-snug">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft dark:text-krem/75">{r.reason}</p>
                  <p className="mt-2 flex gap-1.5 text-sm">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-emas" aria-hidden />
                    <span>{r.action}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Card>
  );
}
