"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaBoxesStacked, FaCalendarDays, FaComments, FaQrcode, FaRightFromBracket, FaTableCellsLarge } from "react-icons/fa6";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Ringkasan", icon: FaTableCellsLarge },
  { href: "/dashboard/content", label: "Content Planner", icon: FaCalendarDays },
  { href: "/dashboard/insights", label: "Insight Pelanggan", icon: FaComments },
  { href: "/dashboard/products", label: "Katalog Produk", icon: FaBoxesStacked },
];

const railBtn =
  "group relative grid size-11 place-items-center rounded-xl text-krem/60 transition hover:bg-white/10 hover:text-krem";

function Tip({ children }: { children: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg sm:block bg-krem px-2.5 py-1 text-xs font-medium text-tanah-900 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-tanah-900/95 px-2 backdrop-blur dark:bg-[#1a110a]/95 sm:relative sm:inset-auto sm:z-20 sm:h-auto sm:w-[84px] sm:shrink-0 sm:flex-col sm:justify-start sm:border-0 sm:bg-transparent sm:px-0 sm:py-5 sm:backdrop-blur-none dark:sm:bg-transparent">
      <Link href="/" aria-label="Beranda" className="mb-10 hidden size-12 place-items-center overflow-hidden rounded-2xl bg-emas-soft sm:grid">
        <Image src="/home/logo-astoetik.png" alt="" width={32} height={32} className="size-8 object-contain" />
      </Link>

      <nav aria-label="Navigasi dashboard" className="flex flex-1 items-center justify-around gap-1 sm:flex-col sm:justify-start sm:gap-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`${railBtn} ${active ? "!text-krem" : ""}`}
            >
              {active && <span aria-hidden className="absolute -top-[9px] left-2 h-[3px] w-7 rounded-full bg-krem sm:-left-[20px] sm:top-2 sm:h-7 sm:w-[3px]" />}
              <Icon className="size-[18px]" aria-hidden />
              <Tip>{label}</Tip>
            </Link>
          );
        })}
        <Link
          href="/dashboard/qr"
          aria-label="Generate QR Code"
          aria-current={pathname.startsWith("/dashboard/qr") ? "page" : undefined}
          className="group relative grid size-11 place-items-center rounded-xl bg-emas text-tanah-900 transition hover:brightness-110 aria-[current=page]:ring-2 aria-[current=page]:ring-krem"
        >
          <FaQrcode className="size-[18px]" aria-hidden />
          <Tip>Generate QR Code</Tip>
        </Link>
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="flex size-11 flex-col items-center justify-center gap-1 rounded-xl text-krem/70 transition hover:bg-white/10 hover:text-krem sm:w-16"
        >
          <FaRightFromBracket className="size-[18px]" aria-hidden />
          <span className="sr-only sm:hidden">Log Out</span>
          <span className="hidden text-[10px] font-semibold leading-none sm:block">Log Out</span>
        </button>
      </form>
    </aside>
  );
}
