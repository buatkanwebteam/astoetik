"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SocialPlatform } from "@/types";
import type { DailyPoint, GroupSummary } from "@/lib/analytics";
import { PLATFORM_META } from "@/lib/analytics";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";

const tooltipStyle = {
  contentStyle: {
    background: "#fffaf3",
    border: "1px solid #e2c4a3",
    borderRadius: 12,
    fontSize: 12,
    color: "#2b1d12",
  },
  labelStyle: { color: "#57321a", fontWeight: 600 },
};

const axis = { stroke: "#ae7646", fontSize: 11, tickLine: false, axisLine: false } as const;

function shortDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function TrendChart({ data, platforms }: { data: DailyPoint[]; platforms: SocialPlatform[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <defs>
            {platforms.map((p) => (
              <linearGradient key={p} id={`fill-${p}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PLATFORM_META[p].color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PLATFORM_META[p].color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#ae7646" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} {...axis} />
          <YAxis tickFormatter={(v: number) => formatCompact(v)} width={56} {...axis} />
          <Tooltip
            {...tooltipStyle}
            labelFormatter={(l) => new Date(String(l)).toLocaleDateString("id-ID", { dateStyle: "medium" })}
            formatter={(v, name) => [formatNumber(Number(v)), PLATFORM_META[name as SocialPlatform]?.label ?? name]}
          />
          <Legend formatter={(v: string) => PLATFORM_META[v as SocialPlatform]?.label ?? v} wrapperStyle={{ fontSize: 12 }} />
          {platforms.map((p) => (
            <Area
              key={p}
              type="monotone"
              dataKey={p}
              stackId="1"
              stroke={PLATFORM_META[p].color}
              fill={`url(#fill-${p})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupBarChart({ data, colors }: { data: GroupSummary[]; colors?: Record<string, string> }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <CartesianGrid stroke="#ae7646" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis yAxisId="er" tickFormatter={(v: number) => formatPercent(v, 0)} width={48} {...axis} />
          <YAxis yAxisId="imp" orientation="right" tickFormatter={(v: number) => formatCompact(v)} width={48} {...axis} />
          <Tooltip
            {...tooltipStyle}
            formatter={(v, name) =>
              name === "engagementRate" ? [formatPercent(Number(v)), "Engagement rate"] : [formatNumber(Number(v)), "Rata-rata impression"]
            }
          />
          <Legend
            formatter={(v: string) => (v === "engagementRate" ? "Engagement rate" : "Rata-rata impression")}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar yAxisId="er" dataKey="engagementRate" radius={[6, 6, 0, 0]} fill="#c8923b">
            {colors && data.map((d) => <Cell key={d.key} fill={colors[d.key] ?? "#c8923b"} />)}
          </Bar>
          <Bar yAxisId="imp" dataKey="avgImpressions" radius={[6, 6, 0, 0]} fill="#ae7646" fillOpacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
