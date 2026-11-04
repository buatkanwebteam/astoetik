"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, LayoutDashboard, Menu, MessagesSquare, QrCode, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/content", label: "Content Planner", icon: CalendarDays },
  { href: "/dashboard/insights", label: "Insight Pelanggan", icon: MessagesSquare },
  { href: "/dashboard/products", label: "Katalog Produk", icon: QrCode },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Navigasi dashboard" className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-emas text-tanah-900" : "text-krem/85 hover:bg-white/10 hover:text-krem"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="mb-8 px-3">
      <p className="font-display text-2xl text-krem">ASTERA-X</p>
      <p className="text-xs text-krem/70">Astoetik Indonesia</p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print fixed left-3 top-3 z-40 grid size-10 place-items-center rounded-xl bg-tanah-600 text-krem shadow lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <aside className="batik-pattern no-print sticky top-0 hidden h-dvh w-60 shrink-0 flex-col p-4 lg:flex">
        {brand}
        {nav}
      </aside>

      {open && (
        <div className="no-print fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <aside className="batik-pattern relative h-full w-64 p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-krem hover:bg-white/10"
              aria-label="Tutup menu"
            >
              <X className="size-5" aria-hidden />
            </button>
            {brand}
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
