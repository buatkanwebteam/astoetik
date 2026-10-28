const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const intl = new Intl.NumberFormat("id-ID");
const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

export const formatRupiah = (n: number) => idr.format(n);
export const formatNumber = (n: number) => intl.format(Math.round(n));
export const formatCompact = (n: number) => compact.format(n);
export const formatPercent = (ratio: number, digits = 1) =>
  `${(Number.isFinite(ratio) ? ratio * 100 : 0).toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  // Fixed timezone so server and client render the same string.
  return new Date(iso).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", ...opts });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
}

export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281325131111";
