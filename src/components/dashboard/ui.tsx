import Link from "next/link";
import type { ReactNode } from "react";
import { FaDownload } from "react-icons/fa6";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`glossy rounded-3xl border border-tanah-900/[0.07] bg-white/60 p-5 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 id={id} className="font-display text-xl font-semibold text-ink dark:text-krem">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-h-10 max-w-full sm:max-w-[calc(100%-13rem)]">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink dark:text-krem">{title}</h1>
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
      className="no-print inline-flex items-center gap-1.5 rounded-full bg-tanah-50 px-3 py-1.5 text-xs font-semibold text-tanah-700 transition hover:bg-tanah-100 dark:bg-white/10 dark:text-krem/90 dark:hover:bg-white/20"
    >
      <FaDownload className="size-3" aria-hidden />
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
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-tanah-900 text-krem dark:bg-emas dark:text-tanah-900"
          : "bg-tanah-50 text-ink-soft hover:bg-tanah-100 dark:bg-white/5 dark:text-krem/80 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </Link>
  );
}

export const mutedText = "text-ink-soft dark:text-krem/70";
