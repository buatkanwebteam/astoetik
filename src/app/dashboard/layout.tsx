import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeBoot, ThemeToggle } from "@/components/dashboard/ThemeToggle";
import LineWaves from "@/components/dashboard/LineWaves";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s - Dashboard" } };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await requireSession();
  const name = session.email.split("@")[0];

  return (
    <div className="relative isolate flex min-h-dvh flex-1 bg-tanah-900 sm:pl-3 dark:bg-[#1a110a]">
      <ThemeBoot />
      <div aria-hidden className="no-print pointer-events-none fixed inset-0 -z-10">
        <LineWaves
          color1="#c8923b"
          color2="#f0cf8a"
          color3="#8c5a2f"
          speed={0.25}
          lineCount={64}
          lineWidth={1.2}
          glow={0.5}
          brightness={0.75}
          warpIntensity={1}
          rotation={-33}
        />
      </div>
      <Sidebar />
      <div className="flex min-w-0 flex-1">
        <div className="m-2 mb-[4.75rem] glossy flex min-w-0 flex-1 flex-col rounded-[1.4rem] border border-white/40 bg-white/50 text-ink backdrop-blur-2xl sm:mx-0 sm:my-3 sm:mr-3 sm:mb-3 sm:rounded-[1.9rem] dark:border-white/10 dark:bg-[#24190f]/70 dark:text-krem">
          <header className="no-print flex items-center justify-end gap-2 px-4 pt-4 sm:absolute sm:right-8 sm:top-7 sm:p-0">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-full bg-tanah-50 py-1 pl-1 pr-3 dark:bg-white/10">
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-tanah-600 text-xs font-bold uppercase text-krem">
                {name.slice(0, 1)}
              </span>
              <span className="max-w-[9rem] truncate text-xs font-semibold" title={session.email}>
                {name}
              </span>
            </div>
          </header>
          <main className="flex-1 px-4 pb-8 pt-3 sm:px-8 sm:pt-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
