import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { isGeminiEnabled, isSupabaseEnabled } from "@/lib/env";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeBoot, ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Dashboard ASTERA-X" } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();

  return (
    <div className="flex min-h-dvh flex-1 bg-krem text-ink dark:bg-[#1b130d] dark:text-krem">
      <ThemeBoot />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-tanah-900/10 bg-krem/90 px-4 py-2.5 pl-16 backdrop-blur lg:pl-6 dark:border-white/10 dark:bg-[#1b130d]/90">
          <div className="mr-auto flex flex-wrap gap-1.5">
            {!isSupabaseEnabled && (
              <span className="rounded-full bg-emas-soft px-2 py-0.5 text-[11px] font-semibold text-tanah-800">Mode Demo: data lokal</span>
            )}
            {!isGeminiEnabled && (
              <span className="rounded-full bg-emas-soft px-2 py-0.5 text-[11px] font-semibold text-tanah-800">Mode Demo: AI mock</span>
            )}
          </div>
          <span className="hidden text-xs text-ink-soft sm:inline dark:text-krem/70">{session.email}</span>
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-ink-soft hover:bg-tanah-100 dark:text-krem/80 dark:hover:bg-white/10"
            >
              <LogOut className="size-4" aria-hidden />
              Keluar
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
