"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaDownload, FaQrcode, FaSpinner } from "react-icons/fa6";
import { todayWib } from "@/lib/units";
import { Select } from "./Select";

export interface QrFormProduct {
  code: string;
  name: string;
  nextSerial: string;
}

interface Made {
  code: string;
  serial: string;
}

const field =
  "block w-full rounded-xl border border-tanah-200 bg-white/70 px-3 py-2.5 text-sm text-ink focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-krem";
const label = "mb-1 block text-xs font-semibold text-ink-soft dark:text-krem/70";

/** Serial n steps after `start`, keeping the zero padding (0009 -> 0010). */
function stepSerial(start: string, n: number) {
  return String(Number(start) + n).padStart(start.length, "0");
}

export function QrGeneratorForm({ products }: { products: QrFormProduct[] }) {
  const router = useRouter();
  const [code, setCode] = useState(products[0]?.code ?? "");
  const current = products.find((p) => p.code === code);
  // Always the last used number + 1, computed on the server. Not editable.
  const serial = current?.nextSerial ?? "0001";
  const [date, setDate] = useState(todayWib());
  const [qty, setQty] = useState("1");
  const [warranty, setWarranty] = useState("12");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<Made[]>([]);

  async function submit() {
    const count = Number(qty);
    const months = Number(warranty);
    if (!code) return setError("Pilih produk dulu.");
    if (!Number.isInteger(count) || count < 1 || count > 50) return setError("Jumlah QR antara 1 sampai 50.");
    if (count > 1 && !/^\d+$/.test(serial)) return setError("Untuk lebih dari 1 QR, nomor produksi awal harus angka (mis. 0001).");
    if (!Number.isInteger(months) || months < 0) return setError("Garansi diisi angka bulan. Isi 0 bila tanpa garansi.");
    if (!date) return setError("Tanggal produksi wajib diisi.");

    setBusy(true);
    setError(null);
    setMade([]);
    const done: Made[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const sn = count > 1 ? stepSerial(serial, i) : serial.trim().toUpperCase();
        const res = await fetch(`/api/products/${encodeURIComponent(code)}/units`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serial: sn,
            productionCode: sn,
            productionDate: date,
            warrantyMonths: months,
            qcDate: null,
            qcInspector: null,
            note: null,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; unit?: { serial: string } };
        if (!res.ok) {
          setError(`${data.error ?? "Gagal membuat QR."}${done.length ? ` ${done.length} QR sebelumnya sudah tersimpan.` : ""}`);
          break;
        }
        done.push({ code, serial: data.unit?.serial ?? sn });
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
    } finally {
      setMade(done);
      setBusy(false);
      if (done.length) router.refresh();
    }
  }

  return (
    <div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="grid gap-4 *:min-w-0 sm:grid-cols-2 xl:grid-cols-6"
      >
        <div className="sm:col-span-2 xl:col-span-2">
          <label htmlFor="qr-product" className={label}>
            Produk
          </label>
          <Select
            id="qr-product"
            ariaLabel="Produk"
            value={code}
            onChange={setCode}
            options={products.map((p) => ({ value: p.code, label: `${p.code} - ${p.name}` }))}
          />
        </div>
        <div>
          <label htmlFor="qr-serial" className={label}>
            Nomor produksi {Number(qty) > 1 ? "(awal, otomatis)" : "(otomatis)"}
          </label>
          <input
            id="qr-serial"
            className={`${field} cursor-not-allowed bg-tanah-50 font-mono text-ink-soft`}
            value={serial}
            readOnly
            aria-readonly="true"
          />
        </div>
        <div>
          <label htmlFor="qr-date" className={label}>
            Tanggal produksi
          </label>
          <input id="qr-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="qr-qty" className={label}>
            Jumlah QR
          </label>
          <input
            id="qr-qty"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            className={`${field} tabular-nums`}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="qr-warranty" className={label}>
            Garansi (bulan)
          </label>
          <input
            id="qr-warranty"
            type="number"
            min={0}
            max={120}
            inputMode="numeric"
            className={`${field} tabular-nums`}
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-6">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-tanah-900 px-5 py-2.5 text-sm font-semibold text-krem transition hover:bg-tanah-800 disabled:opacity-60 dark:bg-emas dark:text-tanah-900"
          >
            {busy ? <FaSpinner className="size-3.5 animate-spin" aria-hidden /> : <FaQrcode className="size-3.5" aria-hidden />}
            {busy ? "Membuat QR…" : "Generate QR"}
          </button>
          <p className="text-xs text-ink-soft dark:text-krem/60">
            Setiap QR unik per unit: memuat produk, nomor produksi, dan tanggal produksi. Semua QR otomatis berstatus Lolos QC.
          </p>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {made.length > 0 && (
        <div aria-live="polite" className="mt-5">
          <p className="mb-3 text-sm font-semibold">{made.length} QR berhasil dibuat</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {made.map((m) => (
              <li key={`${m.code}-${m.serial}`} className="rounded-2xl bg-white p-2 text-center ring-1 ring-tanah-900/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
                <img
                  src={`/api/qr/${encodeURIComponent(m.code)}?seri=${encodeURIComponent(m.serial)}`}
                  alt={`QR ${m.code} nomor produksi ${m.serial}`}
                  className="mx-auto aspect-square w-full max-w-40"
                />
                <p className="mt-1 font-mono text-xs text-ink">
                  {m.code} - {m.serial}
                </p>
                <a
                  href={`/api/qr/${encodeURIComponent(m.code)}?seri=${encodeURIComponent(m.serial)}&download=1`}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-tanah-50 px-2.5 py-1 text-[11px] font-semibold text-tanah-700 hover:bg-tanah-100"
                >
                  <FaDownload className="size-2.5" aria-hidden />
                  Unduh
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
