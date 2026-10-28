import { ArrowDown } from "lucide-react";
import type { FunnelStage } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";

// Fixed tapering widths keep every stage visible; real values sit in the labels.
const WIDTHS = [100, 84, 68, 52, 38];
const SHADES = ["#57321a", "#6b3f1d", "#8c5a2f", "#c8923b", "#e0b56e"];

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <ol className="space-y-1.5" aria-label="Customer journey funnel">
      {stages.map((s, i) => (
        <li key={s.key}>
          {s.fromPrev !== null && (
            <p className="flex items-center justify-center gap-1 py-0.5 text-[11px] text-ink-soft dark:text-krem/60">
              <ArrowDown className="size-3" aria-hidden />
              konversi {formatPercent(s.fromPrev)}
            </p>
          )}
          <div
            className="mx-auto flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-white"
            style={{ width: `${WIDTHS[i]}%`, background: SHADES[i], color: i >= 3 ? "#2a190e" : "#fff" }}
          >
            <span className="truncate text-sm font-medium">{s.label}</span>
            <span className="text-right">
              <span className="block font-semibold tabular-nums">{formatNumber(s.value)}</span>
              {i > 0 && <span className="block text-[10px] opacity-80">{formatPercent(s.fromTop, 2)} dari impression</span>}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
