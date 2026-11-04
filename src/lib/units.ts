import type { ProductUnit, QcStatus } from "@/types";

export const QC_LABEL: Record<QcStatus, string> = {
  lulus: "Lulus QC",
  menunggu: "Menunggu QC",
  "tidak-lulus": "Tidak lulus QC",
};

/** Today as YYYY-MM-DD in WIB, so the warranty flips at local midnight regardless of server TZ. */
export function todayWib(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

/** Last day of warranty (YYYY-MM-DD), or null when the unit has none. */
export function warrantyUntil(unit: Pick<ProductUnit, "productionDate" | "warrantyMonths">): string | null {
  if (unit.warrantyMonths <= 0) return null;
  const [y, m, d] = unit.productionDate.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1 + unit.warrantyMonths, d));
  // 31 Jan + 1 month overflows into March in JS; clamp to the end of the target month.
  if (end.getUTCDate() !== d) end.setUTCDate(0);
  return end.toISOString().slice(0, 10);
}

export type WarrantyState = "aktif" | "berakhir" | "tidak-ada";

export function warrantyState(unit: Pick<ProductUnit, "productionDate" | "warrantyMonths">, today = todayWib()): WarrantyState {
  const until = warrantyUntil(unit);
  if (!until) return "tidak-ada";
  return today <= until ? "aktif" : "berakhir";
}

/** Next free serial like 0001, 0002… based on the numeric serials already used. */
export function nextSerial(units: Pick<ProductUnit, "serial">[]): string {
  const max = units.reduce((n, u) => (/^\d+$/.test(u.serial) ? Math.max(n, Number(u.serial)) : n), 0);
  return String(max + 1).padStart(4, "0");
}
