"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaLightbulb, FaPlus, FaSpinner, FaXmark } from "react-icons/fa6";
import { HoldDelete } from "./HoldDelete";
import { Select } from "./Select";
import type { ContentPlan, ContentPlatform, ContentStatus } from "@/types";
import { Card, CardTitle, ExportLink } from "./ui";

interface ProductOption {
  code: string;
  name: string;
}

const PLATFORM_STYLE: Record<ContentPlatform, { label: string; chip: string; dot: string }> = {
  instagram: { label: "Instagram", chip: "bg-[#c2338a]/12 text-[#9c1f6c] ring-[#c2338a]/30 dark:text-[#f38bc9]", dot: "#c2338a" },
  tiktok: { label: "TikTok", chip: "bg-[#0f9e99]/12 text-[#0a6f6b] ring-[#0f9e99]/30 dark:text-[#5fd8d3]", dot: "#0f9e99" },
};

const STATUS_LABEL: Record<ContentStatus, string> = { idea: "Ide", draft: "Draft", scheduled: "Terjadwal", posted: "Terposting" };
const FORMATS = ["reel", "carousel", "video", "live", "story"];
const noopSubscribe = () => () => {};
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type Draft = Omit<ContentPlan, "id" | "createdByAi"> & { id?: string; createdByAi?: boolean };

function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(year, month, 1 - offset);
  const weeks = Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function ContentPlanner({ initialPlans, products }: { initialPlans: ContentPlan[]; products: ProductOption[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [filter, setFilter] = useState<ContentPlatform | "all">("all");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gen, setGen] = useState({ platform: "both", count: 5, theme: "" });
  const [generating, setGenerating] = useState(false);
  const [genNote, setGenNote] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const days = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const monthKey = `${cursor.year}-${pad(cursor.month + 1)}`;
  const visible = plans.filter((p) => filter === "all" || p.platform === filter);
  const byDay = useMemo(() => {
    const map = new Map<string, ContentPlan[]>();
    for (const p of visible) {
      const k = ymd(new Date(p.scheduledAt));
      map.set(k, [...(map.get(k) ?? []), p].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)));
    }
    return map;
  }, [visible]);
  const ideasThisMonth = visible.filter((p) => p.status === "idea" && toLocalInput(p.scheduledAt).startsWith(monthKey));
  const today = ymd(new Date());

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function openNew(date: Date) {
    const at = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0);
    setError(null);
    setEditing({ platform: "instagram", title: "", caption: "", format: "reel", scheduledAt: at.toISOString(), status: "draft", productCode: null });
  }

  async function save(draft: Draft) {
    setError(null);
    const payload = {
      platform: draft.platform,
      title: draft.title,
      caption: draft.caption,
      format: draft.format,
      scheduledAt: draft.scheduledAt,
      status: draft.status,
      productCode: draft.productCode,
    };
    const res = await fetch(draft.id ? `/api/content-plans/${draft.id}` : "/api/content-plans", {
      method: draft.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { plan?: ContentPlan; error?: string };
    if (!res.ok || !data.plan) {
      setError(data.error ?? "Gagal menyimpan.");
      return;
    }
    const plan = data.plan;
    setPlans((ps) => (draft.id ? ps.map((p) => (p.id === plan.id ? plan : p)) : [...ps, plan]));
    setEditing(null);
  }

  async function remove(id: string) {
    const res = await fetch(`/api/content-plans/${id}`, { method: "DELETE" });
    if (res.ok) {
      // Let the "Terhapus" state show before the dialog closes.
      window.setTimeout(() => {
        setPlans((ps) => ps.filter((p) => p.id !== id));
        setEditing(null);
      }, 700);
    } else setError("Gagal menghapus.");
  }

  async function moveTo(id: string, date: Date) {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const old = new Date(plan.scheduledAt);
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), old.getHours(), old.getMinutes()).toISOString();
    if (next === plan.scheduledAt) return;
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, scheduledAt: next } : p)));
    const res = await fetch(`/api/content-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: next }),
    });
    if (!res.ok) setPlans((ps) => ps.map((p) => (p.id === id ? plan : p)));
  }

  async function generate() {
    setGenerating(true);
    setGenNote(null);
    try {
      const res = await fetch("/api/ai/content-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: gen.platform, count: gen.count, month: monthKey, theme: gen.theme || undefined }),
      });
      const data = (await res.json()) as { plans?: ContentPlan[]; error?: string };
      if (!res.ok || !data.plans) throw new Error(data.error ?? "Gagal membuat ide.");
      setPlans((ps) => [...ps, ...data.plans!]);
      setGenNote(`${data.plans.length} ide ditambahkan sebagai status "Ide".`);
    } catch (e) {
      setGenNote(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setGenerating(false);
    }
  }

  // Times depend on the viewer's timezone, so the calendar renders client-side only.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) {
    return (
      <Card>
        <p className="text-sm text-ink-soft dark:text-krem/70">Memuat kalender…</p>
      </Card>
    );
  }

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="grid gap-6 *:min-w-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya" className="grid size-8 place-items-center rounded-lg hover:bg-tanah-50 dark:hover:bg-white/10">
              <FaChevronLeft className="size-4" aria-hidden />
            </button>
            <h2 className="min-w-40 text-center font-display text-xl capitalize text-tanah-700 dark:text-emas-soft" aria-live="polite">
              {monthLabel}
            </h2>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya" className="grid size-8 place-items-center rounded-lg hover:bg-tanah-50 dark:hover:bg-white/10">
              <FaChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "instagram", "tiktok"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === f ? "bg-tanah-600 text-white dark:bg-emas dark:text-tanah-900" : "ring-1 ring-tanah-900/10 dark:ring-white/15"
                }`}
              >
                {f === "all" ? "Semua" : PLATFORM_STYLE[f].label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openNew(new Date(cursor.year, cursor.month, new Date().getMonth() === cursor.month ? new Date().getDate() : 1))}
              className="inline-flex items-center gap-1 rounded-lg bg-tanah-600 px-3 py-1.5 text-xs font-semibold text-white dark:bg-emas dark:text-tanah-900"
            >
              <FaPlus className="size-3.5" aria-hidden /> Tambah
            </button>
            <ExportLink href="/api/export/content" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 sm:min-w-[640px] gap-px overflow-hidden rounded-xl bg-tanah-900/10 dark:bg-white/10">
            {WEEKDAYS.map((w) => (
              <div key={w} className="bg-tanah-50 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft dark:bg-[#2c1f14] dark:text-krem/70">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const key = ymd(d);
              const inMonth = d.getMonth() === cursor.month;
              const items = byDay.get(key) ?? [];
              return (
                <div
                  key={key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dragId && void moveTo(dragId, d)}
                  className={`group min-h-16 bg-white p-1 sm:min-h-24 sm:p-1.5 dark:bg-[#24190f] ${inMonth ? "" : "opacity-45"}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`grid size-5 place-items-center rounded-full text-[11px] sm:size-6 sm:text-xs ${
                        key === today ? "bg-emas font-bold text-tanah-900" : "text-ink-soft dark:text-krem/70"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <button
                      type="button"
                      onClick={() => openNew(d)}
                      aria-label={`Tambah konten ${d.toLocaleDateString("id-ID", { dateStyle: "long" })}`}
                      className="grid size-5 place-items-center rounded text-ink-soft opacity-0 transition hover:bg-tanah-50 focus:opacity-100 group-hover:opacity-100 dark:text-krem/70 dark:hover:bg-white/10"
                    >
                      <FaPlus className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {items.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          draggable
                          onDragStart={() => setDragId(p.id)}
                          onDragEnd={() => setDragId(null)}
                          onClick={() => {
                            setError(null);
                            setEditing(p);
                          }}
                          title={p.title}
                          aria-label={p.title} className={`block w-full truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium ring-1 max-sm:h-1.5 max-sm:overflow-hidden max-sm:px-0 max-sm:py-0 max-sm:text-transparent ${PLATFORM_STYLE[p.platform].chip} ${
                            p.status === "posted" ? "line-through opacity-70" : ""
                          } ${p.status === "idea" ? "border border-dashed border-current" : ""}`}
                        >
                          {new Date(p.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-soft dark:text-krem/60">
          Klik tanggal untuk menambah, klik konten untuk mengubah, seret konten ke tanggal lain untuk menjadwal ulang.
        </p>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <FaLightbulb className="size-4 text-emas" aria-hidden /> Generate ide
            </span>
          </CardTitle>
          <div className="space-y-3 text-sm">
            <div>
              <label htmlFor="gen-platform" className="mb-1 block text-xs font-medium">Platform</label>
              <Select
                id="gen-platform"
                size="field"
                corner={8}
                ariaLabel="Platform"
                value={gen.platform}
                onChange={(v) => setGen({ ...gen, platform: v })}
                options={[
                  { value: "both", label: "Instagram + TikTok" },
                  { value: "instagram", label: "Instagram" },
                  { value: "tiktok", label: "TikTok" },
                ]}
              />
            </div>
            <div>
              <label htmlFor="gen-count" className="mb-1 block text-xs font-medium">Jumlah ide</label>
              <input
                id="gen-count"
                type="number"
                min={1}
                max={8}
                value={gen.count}
                onChange={(e) => setGen({ ...gen, count: Math.min(8, Math.max(1, Number(e.target.value) || 1)) })}
                className="w-full rounded-lg border border-tanah-200 bg-krem px-2.5 py-2 dark:border-white/15 dark:bg-white/5"
              />
            </div>
            <div>
              <label htmlFor="gen-theme" className="mb-1 block text-xs font-medium">Tema (opsional)</label>
              <input
                id="gen-theme"
                value={gen.theme}
                maxLength={200}
                onChange={(e) => setGen({ ...gen, theme: e.target.value })}
                placeholder="mis. Hari Batik Nasional"
                className="w-full rounded-lg border border-tanah-200 bg-krem px-2.5 py-2 dark:border-white/15 dark:bg-white/5"
              />
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emas px-3 py-2 text-sm font-semibold text-tanah-900 disabled:opacity-60"
            >
              {generating ? <FaSpinner className="size-4 animate-spin" aria-hidden /> : <FaLightbulb className="size-4" aria-hidden />}
              <span>Generate untuk <span className="capitalize">{monthLabel}</span></span>
            </button>
            {genNote && <p className="text-xs text-ink-soft dark:text-krem/70" role="status">{genNote}</p>}
          </div>
        </Card>

        <Card>
          <CardTitle>Bank ide bulan ini</CardTitle>
          {ideasThisMonth.length === 0 ? (
            <p className="text-sm text-ink-soft dark:text-krem/70">Belum ada ide. Coba tombol Generate.</p>
          ) : (
            <ul className="space-y-2">
              {ideasThisMonth.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="w-full rounded-lg p-2 text-left text-sm hover:bg-tanah-50 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] text-ink-soft dark:text-krem/60">
                      <span className="size-2 rounded-full" style={{ background: PLATFORM_STYLE[p.platform].dot }} aria-hidden />
                      {PLATFORM_STYLE[p.platform].label} - {new Date(p.scheduledAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      {p.createdByAi && ", AI"}
                    </span>
                    <span className="font-medium">{p.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Portaled to <body>: the glass panel's backdrop-filter would otherwise trap this fixed overlay inside it. */}
      {editing &&
        createPortal(
          <PlanDialog
            draft={editing}
            products={products}
            error={error}
            onClose={() => setEditing(null)}
            onSave={save}
            onDelete={editing.id ? () => remove(editing.id!) : undefined}
          />,
          document.body,
        )}
    </div>
  );
}

function PlanDialog({
  draft: initial,
  products,
  error,
  onClose,
  onSave,
  onDelete,
}: {
  draft: Draft;
  products: ProductOption[];
  error: string | null;
  onClose: () => void;
  onSave: (d: Draft) => Promise<void>;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const field = "w-full rounded-lg border border-tanah-200 bg-krem px-2.5 py-2 text-sm dark:border-white/15 dark:bg-white/5";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="plan-title">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Tutup" onClick={onClose} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave(draft);
          setSaving(false);
        }}
        className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#24190f] dark:text-krem"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="plan-title" className="font-display text-xl text-tanah-700 dark:text-emas-soft">
            {draft.id ? "Ubah rencana konten" : "Rencana konten baru"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="grid size-8 place-items-center rounded-lg hover:bg-tanah-50 dark:hover:bg-white/10">
            <FaXmark className="size-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="pl-title" className="mb-1 block text-xs font-medium">Judul</label>
            <input id="pl-title" ref={firstRef} required maxLength={160} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pl-caption" className="mb-1 block text-xs font-medium">Caption</label>
            <textarea id="pl-caption" rows={3} maxLength={2000} value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} className={field} />
          </div>
          <div>
            <label htmlFor="pl-platform" className="mb-1 block text-xs font-medium">Platform</label>
            <Select
              id="pl-platform"
              size="field"
              corner={8}
              ariaLabel="Platform"
              value={draft.platform}
              onChange={(v) => setDraft({ ...draft, platform: v as ContentPlatform })}
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "tiktok", label: "TikTok" },
              ]}
            />
          </div>
          <div>
            <label htmlFor="pl-format" className="mb-1 block text-xs font-medium">Format</label>
            <Select
              id="pl-format"
              size="field"
              corner={8}
              ariaLabel="Format"
              value={draft.format}
              onChange={(v) => setDraft({ ...draft, format: v })}
              options={[...new Set([...FORMATS, draft.format])].map((f) => ({ value: f, label: f }))}
            />
          </div>
          <div>
            <label htmlFor="pl-date" className="mb-1 block text-xs font-medium">Jadwal</label>
            <input
              id="pl-date"
              type="datetime-local"
              required
              value={toLocalInput(draft.scheduledAt)}
              onChange={(e) => e.target.value && setDraft({ ...draft, scheduledAt: new Date(e.target.value).toISOString() })}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="pl-status" className="mb-1 block text-xs font-medium">Status</label>
            <Select
              id="pl-status"
              size="field"
              corner={8}
              ariaLabel="Status"
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v as ContentStatus })}
              options={(Object.keys(STATUS_LABEL) as ContentStatus[]).map((st) => ({ value: st, label: STATUS_LABEL[st] }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pl-product" className="mb-1 block text-xs font-medium">Produk terkait</label>
            <Select
              id="pl-product"
              size="field"
              corner={8}
              ariaLabel="Produk terkait"
              value={draft.productCode ?? ""}
              onChange={(v) => setDraft({ ...draft, productCode: v || null })}
              options={[{ value: "", label: "Tidak ada" }, ...products.map((pr) => ({ value: pr.code, label: `${pr.code} - ${pr.name}` }))]}
            />
          </div>
        </div>
        {draft.createdByAi && <p className="mt-3 text-xs text-ink-soft dark:text-krem/60">Ide ini dibuat oleh AI. Periksa kembali sebelum diposting.</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <div className="mt-5 flex items-center justify-between gap-2">
          {onDelete ? (
            <HoldDelete onConfirm={onDelete} />
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-tanah-50 dark:hover:bg-white/10">Batal</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-tanah-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-emas dark:text-tanah-900">
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
