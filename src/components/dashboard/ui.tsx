import Link from "next/link";
import type { ReactNode } from "react";
import { Download, FlaskConical } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-tanah-900/10 dark:bg-[#24190f] dark:ring-white/10 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 id={id} className="font-display text-lg text-tanah-700 dark:text-emas-soft">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function DummyBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emas bg-emas-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-tanah-800">
      <FlaskConical className="size-3" aria-hidden />
      Data Dummy
    </span>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-tanah-700 dark:text-krem">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft dark:text-krem/70">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ExportLink({ href, label = "Export .xlsx" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      className="no-print inline-flex items-center gap-1.5 rounded-lg border border-tanah-200 px-2.5 py-1.5 text-xs font-medium text-tanah-700 transition hover:bg-tanah-50 dark:border-white/15 dark:text-krem/90 dark:hover:bg-white/10"
    >
      <Download className="size-3.5" aria-hidden />
      {label}
    </a>
  );
}

export function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-tanah-600 text-white dark:bg-emas dark:text-tanah-900"
          : "bg-white text-ink-soft ring-1 ring-tanah-900/10 hover:bg-tanah-50 dark:bg-white/5 dark:text-krem/80 dark:ring-white/10 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

export const mutedText = "text-ink-soft dark:text-krem/70";
