import type { IconType } from "react-icons";
import { FaArrowDown, FaCartShopping, FaEye, FaHandPointer, FaHeart, FaUser } from "react-icons/fa6";
import type { FunnelStage } from "@/lib/analytics";
import { formatPercent } from "@/lib/format";
import { CountUp } from "./fx";

// Fixed tapering widths keep every stage visible and readable; the real
// values and conversion rates sit in the labels.
const WIDTHS = [100, 94, 88, 82, 76];
const GRADIENTS = [
  ["#3e2414", "#6b3f1d"],
  ["#57321a", "#8c5a2f"],
  ["#6b3f1d", "#ae7646"],
  ["#b07a2a", "#e0b56e"],
  ["#d8a24a", "#f3dc9e"],
];
const ICONS: IconType[] = [FaEye, FaHeart, FaUser, FaHandPointer, FaCartShopping];

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const last = stages.at(-1);

  return (
    <div>
      <ol aria-label="Customer journey funnel">
        {stages.map((s, i) => {
          const Icon = ICONS[i] ?? FaEye;
          const light = i >= 3;
          const [from, to] = GRADIENTS[i] ?? GRADIENTS[0];
          return (
            <li key={s.key}>
              {s.fromPrev !== null && (
                <div className="my-1.5 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-tanah-50 px-3 py-1 text-[11px] font-semibold text-tanah-700 ring-1 ring-tanah-900/5 dark:bg-white/10 dark:text-krem/85 dark:ring-white/10">
                    <FaArrowDown className="size-2.5 text-emas" aria-hidden />
                    konversi {formatPercent(s.fromPrev)}
                  </span>
                </div>
              )}
              <div
                className={`relative mx-auto flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 shadow-[0_10px_24px_-14px_rgba(42,25,14,0.7)] ${light ? "text-tanah-900" : "text-white"}`}
                style={{ width: `${WIDTHS[i]}%`, backgroundImage: `linear-gradient(100deg, ${from}, ${to})` }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                <span className={`relative grid size-10 shrink-0 place-items-center rounded-xl ${light ? "bg-white/45" : "bg-white/20"}`}>
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <div className="relative min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.label}</p>
                  {i > 0 && <p className={`text-[11px] ${light ? "text-tanah-900/70" : "text-white/75"}`}>{formatPercent(s.fromTop, 2)} dari impression</p>}
                </div>
                <p className="relative font-display text-xl font-semibold tabular-nums">
                  <CountUp to={s.value} />
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {last && (
        <p className="mt-4 rounded-2xl bg-tanah-50 px-4 py-2.5 text-center text-xs text-ink-soft dark:bg-white/5 dark:text-krem/70">
          Dari impression sampai purchase: <span className="font-semibold text-tanah-700 dark:text-emas">{formatPercent(last.fromTop, 3)}</span>
        </p>
      )}
    </div>
  );
}
