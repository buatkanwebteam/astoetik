import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Clock, ShieldCheck, ShieldOff } from "lucide-react";
import type { ProductUnit } from "@/types";
import { formatDate } from "@/lib/format";
import { QC_LABEL, warrantyState, warrantyUntil } from "@/lib/units";

const date = (iso: string) => formatDate(`${iso}T00:00:00+07:00`, { day: "numeric", month: "long", year: "numeric" });

function Pill({ tone, icon: Icon, children }: { tone: "ok" | "warn" | "muted"; icon: typeof CircleCheck; children: string }) {
  const cls = {
    ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    warn: "bg-red-50 text-red-800 ring-red-200",
    muted: "bg-kat-raised text-kat-muted ring-kat-line",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium ring-1 ${cls}`}>
      <Icon className="size-3" aria-hidden />
      {children}
    </span>
  );
}

/** Data unique to one physical unit, shown on /p/[kode]/[seri]. */
export function UnitCard({ unit }: { unit: ProductUnit }) {
  const until = warrantyUntil(unit);
  const warranty = warrantyState(unit);
  const qcIcon = { lulus: CircleCheck, menunggu: Clock, "tidak-lulus": CircleAlert }[unit.qcStatus];
  const qcTone = ({ lulus: "ok", menunggu: "muted", "tidak-lulus": "warn" } as const)[unit.qcStatus];
  const qcDetail = [unit.qcDate ? date(unit.qcDate) : null, unit.qcInspector ? `oleh ${unit.qcInspector}` : null]
    .filter(Boolean)
    .join(" · ");

  const rows: [string, ReactNode][] = [
    ["Nomor seri", <span key="s" className="font-mono">{unit.serial}</span>],
    ["Kode produksi", <span key="c" className="font-mono">{unit.productionCode}</span>],
    ["Tanggal produksi", date(unit.productionDate)],
    [
      "Garansi",
      warranty === "tidak-ada" ? (
        <span key="g" className="text-kat-muted">Tidak ada garansi</span>
      ) : (
        <span key="g" className="flex flex-wrap items-center gap-2">
          {unit.warrantyMonths} bulan, s/d {date(until!)}
          {warranty === "aktif" ? (
            <Pill tone="ok" icon={ShieldCheck}>Aktif</Pill>
          ) : (
            <Pill tone="muted" icon={ShieldOff}>Berakhir</Pill>
          )}
        </span>
      ),
    ],
    [
      "Quality control",
      <span key="q" className="flex flex-wrap items-center gap-2">
        <Pill tone={qcTone} icon={qcIcon}>{QC_LABEL[unit.qcStatus]}</Pill>
        {qcDetail && <span className="text-kat-muted">{qcDetail}</span>}
      </span>,
    ],
  ];
  if (unit.note) rows.push(["Catatan", unit.note]);

  return (
    <section aria-labelledby="unit-title" className="rounded-md border border-aksen-deep/40 bg-kat-raised/50">
      <h2 id="unit-title" className="border-b border-kat-line px-4 py-3 font-grotesk text-base font-semibold">
        Data unit ini
      </h2>
      <dl className="divide-y divide-kat-line text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[2fr_3fr] gap-2 px-4 py-2.5">
            <dt className="text-kat-muted">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-kat-line px-4 py-2.5 text-[11px] leading-relaxed text-kat-muted">
        Garansi dihitung dari tanggal produksi. Simpan halaman ini atau foto label QR sebagai bukti unit.
      </p>
    </section>
  );
}
