import type { ProductUnit } from "../types";
import { PRODUCTS } from "./products";

// SAMPLE DATA for demos: three units per product. Production codes, dates and
// QC officers are placeholders (not from Astoetik's records) and every unit says
// so in its note. Fixed dates keep the seed stable; the mix is deliberate so the
// unit page shows every state: warranty active / expired, QC passed / pending.

export const SAMPLE_UNIT_NOTE = "Data contoh untuk demo.";
const WARRANTY_MONTHS = 12;

const pad = (n: number) => String(n).padStart(2, "0");

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SAMPLE_UNITS: ProductUnit[] = PRODUCTS.flatMap((p, i) => {
  const batch = pad(i + 1);
  const inspector = `QC-${pad((i % 3) + 1)}`;
  // Every fifth product has an old first unit, so its warranty has already run out.
  const expired = i % 5 === 0;
  const plan: { serial: string; date: string; pendingQc: boolean }[] = [
    { serial: "0001", date: expired ? `2025-08-${pad(4 + i)}` : `2026-05-${pad(4 + i)}`, pendingQc: false },
    { serial: "0002", date: `2026-08-${pad(3 + i)}`, pendingQc: false },
    { serial: "0003", date: `2026-10-${pad(5 + i)}`, pendingQc: i % 4 === 3 },
  ];
  return plan.map(({ serial, date, pendingQc }) => ({
    productCode: p.code,
    serial,
    productionCode: `PRD-${date.slice(2, 4)}${date.slice(5, 7)}-${batch}`,
    productionDate: date,
    warrantyMonths: WARRANTY_MONTHS,
    qcStatus: pendingQc ? "menunggu" : "lulus",
    qcDate: pendingQc ? null : addDays(date, 1),
    qcInspector: pendingQc ? null : inspector,
    note: SAMPLE_UNIT_NOTE,
    createdAt: `${date}T09:00:00.000Z`,
  }));
});
