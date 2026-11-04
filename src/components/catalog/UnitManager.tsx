"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import type { ProductUnit, QcStatus } from "@/types";
import { formatDate } from "@/lib/format";
import { QC_LABEL, nextSerial, todayWib, warrantyState, warrantyUntil } from "@/lib/units";
import { Drawer } from "./Drawer";
import { iconBtn } from "./ProductCard";

const FORM_ID = "unit-form";
const DEFAULT_WARRANTY_MONTHS = 12;

const input =
  "h-10 w-full rounded-sm border border-kat-line bg-kat-card px-3 text-sm text-kat-text placeholder:text-kat-muted/70 transition-colors duration-150 focus:border-aksen focus:outline-none disabled:bg-kat-raised disabled:text-kat-muted";

const shortDate = (iso: string) => formatDate(`${iso}T00:00:00+07:00`);

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-kat-text">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-kat-muted">{hint}</span>}
    </label>
  );
}

const QC_TONE: Record<QcStatus, string> = {
  lulus: "text-emerald-700 dark:text-emerald-300",
  menunggu: "text-kat-muted",
  "tidak-lulus": "text-red-700 dark:text-red-300",
};

function UnitForm({
  productCode,
  unit,
  template,
  suggestedSerial,
  onBusy,
  onSaved,
  onError,
}: {
  productCode: string;
  /** null = new unit. */
  unit: ProductUnit | null;
  /** Latest unit, used to prefill a new one (same batch code / warranty is the common case). */
  template: ProductUnit | null;
  suggestedSerial: string;
  onBusy: (busy: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const base = unit ?? template;
  const [serial, setSerial] = useState(unit?.serial ?? suggestedSerial);
  const [productionCode, setProductionCode] = useState(base?.productionCode ?? "");
  const [productionDate, setProductionDate] = useState(unit?.productionDate ?? todayWib());
  const [warrantyMonths, setWarrantyMonths] = useState(String(base?.warrantyMonths ?? DEFAULT_WARRANTY_MONTHS));
  const [qcStatus, setQcStatus] = useState<QcStatus>(unit?.qcStatus ?? "lulus");
  const [qcDate, setQcDate] = useState(unit ? (unit.qcDate ?? "") : todayWib());
  const [qcInspector, setQcInspector] = useState(base?.qcInspector ?? "");
  const [note, setNote] = useState(unit?.note ?? "");

  const until = productionDate ? warrantyUntil({ productionDate, warrantyMonths: Number(warrantyMonths) || 0 }) : null;

  async function submit() {
    const months = Number(warrantyMonths);
    if (warrantyMonths.trim() === "" || !Number.isInteger(months)) {
      onError("Garansi diisi angka bulan, mis. 12. Isi 0 bila tanpa garansi.");
      return;
    }
    const body = {
      ...(unit ? {} : { serial }),
      productionCode,
      productionDate,
      warrantyMonths: months,
      qcStatus,
      qcDate: qcDate || null,
      qcInspector: qcInspector.trim() || null,
      note: note.trim() || null,
    };
    onBusy(true);
    onError(null);
    try {
      const endpoint = `/api/products/${encodeURIComponent(productCode)}/units`;
      const res = await fetch(unit ? `${endpoint}/${encodeURIComponent(unit.serial)}` : endpoint, {
        method: unit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        onError(data.error ?? "Gagal menyimpan unit.");
        return;
      }
      onSaved(unit ? `Unit ${unit.serial} diperbarui.` : `Unit ${serial.toUpperCase()} ditambahkan.`);
    } catch {
      onError("Koneksi gagal. Coba lagi.");
    } finally {
      onBusy(false);
    }
  }

  return (
    <form
      id={FORM_ID}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-5 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nomor seri" hint={unit ? "Tidak bisa diubah: tercetak di QR unit." : `URL: /p/${productCode}/${serial || "…"}`}>
          <input
            className={`${input} font-mono uppercase`}
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            disabled={Boolean(unit)}
            maxLength={20}
          />
        </Field>
        <Field label="Kode produksi" hint="Mis. kode batch/lot dari bagian produksi.">
          <input className={`${input} font-mono`} value={productionCode} onChange={(e) => setProductionCode(e.target.value)} maxLength={60} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tanggal produksi">
          <input className={input} type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} />
        </Field>
        <Field
          label="Garansi (bulan)"
          hint={until ? `Berlaku s/d ${shortDate(until)} (dihitung dari tanggal produksi).` : "0 = tanpa garansi."}
        >
          <input
            className={`${input} font-mono tabular-nums`}
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={warrantyMonths}
            onChange={(e) => setWarrantyMonths(e.target.value)}
          />
        </Field>
      </div>

      <fieldset className="space-y-4 rounded-sm border border-kat-line p-4">
        <legend className="px-1 font-grotesk text-sm font-semibold">Quality control</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select className={input} value={qcStatus} onChange={(e) => setQcStatus(e.target.value as QcStatus)}>
              {(Object.keys(QC_LABEL) as QcStatus[]).map((s) => (
                <option key={s} value={s}>
                  {QC_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal QC">
            <input className={input} type="date" value={qcDate} onChange={(e) => setQcDate(e.target.value)} />
          </Field>
          <Field label="Petugas QC">
            <input className={input} value={qcInspector} onChange={(e) => setQcInspector(e.target.value)} maxLength={80} />
          </Field>
        </div>
        <p className="text-[11px] text-kat-muted">Status, tanggal, dan nama petugas QC tampil di halaman publik unit.</p>
      </fieldset>

      <Field label="Catatan unit" hint="Opsional. Tampil di halaman publik.">
        <textarea
          className={`${input} h-20 resize-none py-2`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
        />
      </Field>

      {unit && (
        <div className="flex items-center gap-4 border-t border-kat-line pt-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
          <img
            src={`/api/qr/${productCode}?seri=${encodeURIComponent(unit.serial)}`}
            alt={`QR unit ${unit.serial}`}
            className="size-28 rounded-sm border border-kat-line bg-white p-1"
          />
          <a
            href={`/api/qr/${productCode}?seri=${encodeURIComponent(unit.serial)}&download=1`}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-kat-line px-3 text-sm transition-colors duration-150 hover:border-kat-muted"
          >
            <Download className="size-4" aria-hidden />
            Unduh QR unit
          </a>
        </div>
      )}
    </form>
  );
}

type Editor = { mode: "closed" } | { mode: "create" } | { mode: "edit"; serial: string };

export function UnitManager({ productCode, units }: { productCode: string; units: ProductUnit[] }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [editor, setEditor] = useState<Editor>({ mode: "closed" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const editing = editor.mode === "edit" ? (units.find((u) => u.serial === editor.serial) ?? null) : null;
  const latest = units.reduce<ProductUnit | null>((a, u) => (!a || u.createdAt > a.createdAt ? u : a), null);

  function open(next: Editor) {
    setError(null);
    setConfirmDelete(false);
    setEditor(next);
  }

  function done(text: string) {
    setEditor({ mode: "closed" });
    setMessage(text);
    startRefresh(() => router.refresh());
  }

  async function remove(unit: ProductUnit) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productCode)}/units/${encodeURIComponent(unit.serial)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Gagal menghapus unit.");
        return;
      }
      done(`Unit ${unit.serial} dihapus.`);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const th = "px-3 py-2.5 text-left text-[11px] font-medium text-kat-muted";
  const td = "px-3 py-2.5 align-middle";

  return (
    <section aria-labelledby="units-title" className="font-sans text-kat-text">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="units-title" className="font-grotesk text-lg font-semibold">
            Unit produk
          </h2>
          <p className="text-sm text-kat-muted" aria-live="polite">
            {message ?? `${units.length} unit terdaftar. Setiap unit punya QR dan halaman sendiri.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => open({ mode: "create" })}
          className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-aksen-deep px-4 font-grotesk text-sm font-semibold text-on-aksen transition-colors duration-150 hover:bg-aksen"
        >
          <Plus className="size-4" aria-hidden />
          Tambah unit
        </button>
      </div>

      {units.length === 0 ? (
        <div className="grid place-items-center rounded-md border border-dashed border-kat-line bg-kat-card px-6 py-14 text-center">
          <PackageOpen className="size-8 text-kat-muted" aria-hidden />
          <p className="mt-3 font-grotesk font-semibold">Belum ada unit</p>
          <p className="mt-1 max-w-sm text-sm text-kat-muted">
            Daftarkan unit yang sudah diproduksi untuk membuat QR dan halaman unitnya.
          </p>
        </div>
      ) : (
        // `relative` keeps the absolutely positioned sr-only labels inside the scroll box.
        <div className={`relative overflow-x-auto rounded-md border border-kat-line bg-kat-card ${refreshing ? "opacity-60" : ""}`}>
          <table className="w-full min-w-[48rem] text-sm">
            <thead className="border-b border-kat-line bg-kat-raised">
              <tr>
                <th scope="col" className={th}>Seri</th>
                <th scope="col" className={th}>Kode produksi</th>
                <th scope="col" className={th}>Tgl produksi</th>
                <th scope="col" className={th}>Garansi</th>
                <th scope="col" className={th}>QC</th>
                <th scope="col" className={th}>
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kat-line">
              {units.map((u) => {
                const until = warrantyUntil(u);
                const state = warrantyState(u);
                const href = `/p/${productCode}/${encodeURIComponent(u.serial)}`;
                return (
                  <tr key={u.serial}>
                    <th scope="row" className={`${td} text-left font-mono font-medium text-aksen-text`}>
                      {u.serial}
                    </th>
                    <td className={`${td} font-mono text-xs`}>{u.productionCode}</td>
                    <td className={`${td} whitespace-nowrap text-kat-muted`}>{shortDate(u.productionDate)}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      {until ? (
                        <>
                          <span className={state === "aktif" ? "" : "text-kat-muted"}>s/d {shortDate(until)}</span>
                          <span className="ml-1.5 text-[11px] text-kat-muted">({state === "aktif" ? "aktif" : "berakhir"})</span>
                        </>
                      ) : (
                        <span className="text-kat-muted">–</span>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <span className={QC_TONE[u.qcStatus]}>{QC_LABEL[u.qcStatus]}</span>
                      {u.qcInspector && <span className="ml-1.5 text-[11px] text-kat-muted">{u.qcInspector}</span>}
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-1.5">
                        <a
                          href={`/api/qr/${productCode}?seri=${encodeURIComponent(u.serial)}&download=1`}
                          className={iconBtn}
                          aria-label={`Unduh QR unit ${u.serial}`}
                          title="Unduh QR unit"
                        >
                          <Download className="size-4" aria-hidden />
                        </a>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={iconBtn}
                          aria-label={`Buka halaman unit ${u.serial}`}
                          title="Buka halaman unit"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                        <button
                          type="button"
                          onClick={() => open({ mode: "edit", serial: u.serial })}
                          className={iconBtn}
                          aria-label={`Edit unit ${u.serial}`}
                          title="Edit"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={editor.mode !== "closed"}
        onClose={() => setEditor({ mode: "closed" })}
        side="right"
        wide
        title={editing ? `Unit ${editing.serial}` : "Tambah unit"}
        footer={
          <div className="space-y-3">
            {error && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            {editing && confirmDelete ? (
              <div className="rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                <p>
                  Hapus unit <strong>{editing.serial}</strong>? QR yang sudah ditempel di unit ini tidak akan bisa dibuka lagi.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void remove(editing)}
                    disabled={busy}
                    className="h-9 rounded-sm bg-red-700 px-3 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                  >
                    {busy ? "Menghapus…" : "Ya, hapus"}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="h-9 rounded-sm px-3 hover:underline">
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                {editing ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-sm px-3 text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Hapus
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditor({ mode: "closed" })}
                    className="h-10 rounded-sm border border-kat-line px-4 text-sm hover:border-kat-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form={FORM_ID}
                    disabled={busy}
                    className="h-10 rounded-sm bg-aksen-deep px-5 font-grotesk text-sm font-semibold text-on-aksen hover:bg-aksen disabled:opacity-60"
                  >
                    {busy ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        }
      >
        {editor.mode !== "closed" && (
          <UnitForm
            key={editor.mode === "edit" ? editor.serial : "new"}
            productCode={productCode}
            unit={editing}
            template={latest}
            suggestedSerial={nextSerial(units)}
            onBusy={setBusy}
            onSaved={done}
            onError={setError}
          />
        )}
      </Drawer>
    </section>
  );
}
