import type { ReactNode } from "react";
import { FaBarcode, FaCalendarDays, FaCircleCheck, FaClockRotateLeft, FaIndustry, FaShieldHalved } from "react-icons/fa6";
import type { ProductUnit } from "@/types";
import { formatDate } from "@/lib/format";
import { QC_LABEL, warrantyState, warrantyUntil } from "@/lib/units";

const date = (iso: string) => formatDate(`${iso}T00:00:00+07:00`, { day: "numeric", month: "long", year: "numeric" });

function Tile({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-tanah-50 p-4">
      <p className="flex items-center gap-2 text-xs font-medium text-ink-soft">
        <span className="grid size-6 place-items-center rounded-lg bg-white text-tanah-600 shadow-sm">{icon}</span>
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold leading-snug">{children}</div>
    </div>
  );
}

/** Data unique to one physical unit, shown on /p/[kode]/[seri]. */
export function UnitCard({ unit }: { unit: ProductUnit }) {
  const until = warrantyUntil(unit);
  const warranty = warrantyState(unit);
  const qcDetail = [unit.qcDate ? date(unit.qcDate) : null, unit.qcInspector ? `oleh ${unit.qcInspector}` : null].filter(Boolean).join(", ");

  return (
    <section aria-labelledby="unit-title" className="glossy overflow-hidden rounded-3xl border border-tanah-900/[0.07] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-tanah-900 to-tanah-600 px-5 py-4 text-krem sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/15 text-hm-gold">
            <FaBarcode className="size-4" aria-hidden />
          </span>
          <h2 id="unit-title" className="font-display text-xl font-semibold">
            Data unit ini
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-3.5 py-1.5 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-300/40">
          <FaCircleCheck className="size-3.5" aria-hidden />
          {QC_LABEL.lulus}
        </span>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <Tile icon={<FaBarcode className="size-3" aria-hidden />} label="Nomor produksi">
          <span className="font-mono text-lg">{unit.serial}</span>
          {unit.productionCode !== unit.serial && <span className="mt-0.5 block font-mono text-xs font-medium text-ink-soft">{unit.productionCode}</span>}
        </Tile>
        <Tile icon={<FaCalendarDays className="size-3" aria-hidden />} label="Tanggal produksi">
          {date(unit.productionDate)}
        </Tile>
        <Tile icon={<FaShieldHalved className="size-3" aria-hidden />} label="Garansi">
          {warranty === "tidak-ada" ? (
            <span className="text-ink-soft">Tidak ada garansi</span>
          ) : (
            <>
              {unit.warrantyMonths} bulan
              <span className="mt-0.5 block text-xs font-medium text-ink-soft">s/d {date(until!)}</span>
              {warranty === "aktif" ? (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <FaCircleCheck className="size-2.5" aria-hidden /> Aktif
                </span>
              ) : (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-tanah-100 px-2 py-0.5 text-[11px] font-semibold text-tanah-700">
                  <FaClockRotateLeft className="size-2.5" aria-hidden /> Berakhir
                </span>
              )}
            </>
          )}
        </Tile>
        <Tile icon={<FaIndustry className="size-3" aria-hidden />} label="Quality control">
          {QC_LABEL.lulus}
          {qcDetail && <span className="mt-0.5 block text-xs font-medium text-ink-soft">{qcDetail}</span>}
        </Tile>
        {unit.note && (
          <div className="rounded-2xl bg-emas-soft/50 p-4 text-sm sm:col-span-2 lg:col-span-4">
            <p className="text-xs font-medium text-ink-soft">Catatan</p>
            <p className="mt-1 font-medium">{unit.note}</p>
          </div>
        )}
      </div>

      <p className="border-t border-tanah-900/[0.07] px-5 py-3 text-xs leading-relaxed text-ink-soft sm:px-6">
        Garansi dihitung dari tanggal produksi. Simpan halaman ini atau foto label QR sebagai bukti unit.
      </p>
    </section>
  );
}
