const idr = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const intl = new Intl.NumberFormat("id-ID");
const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

export const formatRupiah = (n: number) => idr.format(n);
export const formatNumber = (n: number) => intl.format(Math.round(n));
export const formatCompact = (n: number) => compact.format(n);
export const formatPercent = (ratio: number, digits = 1) =>
  `${(Number.isFinite(ratio) ? ratio * 100 : 0).toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("id-ID", opts);
}

export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281325131111";
