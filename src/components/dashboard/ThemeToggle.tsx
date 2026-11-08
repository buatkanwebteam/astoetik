"use client";

import { FaMoon, FaSun } from "react-icons/fa6";
import { useEffect, useSyncExternalStore } from "react";

const KEY = "astera-theme";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? "light",
    () => "light",
  );
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const next = dark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // ignore
        }
      }}
      aria-label={dark ? "Gunakan mode terang" : "Gunakan mode gelap"}
      className="grid size-10 place-items-center rounded-full bg-tanah-50 text-ink-soft transition hover:bg-tanah-100 dark:bg-white/10 dark:text-krem/80 dark:hover:bg-white/20"
    >
      {dark ? <FaSun className="size-4" aria-hidden /> : <FaMoon className="size-4" aria-hidden />}
    </button>
  );
}

/** Inline script applied before paint to avoid a light flash. */
const THEME_BOOT_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("${KEY}")||"light"}catch(e){}`;

/**
 * Hard loads: the inline script sets the theme before first paint.
 * Client-side navigations never execute inserted scripts, so the effect applies
 * the theme on the way in and clears it on the way out (dark mode is dashboard-only).
 * The script is typed text/plain on the client so React does not warn about it
 * (pattern from Next docs: preventing-flash-before-hydration).
 */
export function ThemeBoot() {
  useEffect(() => {
    try {
      document.documentElement.dataset.theme = localStorage.getItem(KEY) || "light";
    } catch {
      // ignore
    }
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, []);

  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
    />
  );
}
