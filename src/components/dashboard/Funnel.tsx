import { ArrowDown } from "lucide-react";
import type { FunnelStage } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";

// Fixed tapering widths keep every stage visible and readable; the real
// values and conversion rates sit in the labels.
const WIDTHS = [100, 93, 86, 79, 72];
const SHADES = ["#57321a", "#6b3f1d", "#8c5a2f", "#c8923b", "#e0b56e"];

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <ol className="space-y-1" aria-label="Customer journey funnel">
      {stages.map((s, i) => (
        <li key={s.key}>
          {s.fromPrev !== null && (
            <p className="flex items-center justify-center gap-1 py-0.5 text-[11px] text-ink-soft dark:text-krem/60">
              <ArrowDown className="size-3" aria-hidden />
              konversi {formatPercent(s.fromPrev)}
            </p>
          )}
          <div
            className="mx-auto flex items-baseline justify-between gap-2 rounded-xl px-3.5 py-2.5"
            style={{ width: `${WIDTHS[i]}%`, background: SHADES[i], color: i >= 3 ? "#2a190e" : "#fff" }}
          >
            <span className="text-sm font-medium">{s.label}</span>
            <span className="font-semibold tabular-nums">{formatNumber(s.value)}</span>
          </div>
          {i > 0 && (
            <p className="mt-0.5 text-center text-[10px] text-ink-soft dark:text-krem/50">
              {formatPercent(s.fromTop, 2)} dari impression
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
