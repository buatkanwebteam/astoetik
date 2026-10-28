"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

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
      className="grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-tanah-100 dark:text-krem/80 dark:hover:bg-white/10"
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}

/** Inline script applied before paint to avoid a light flash. */
export const THEME_BOOT_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("${KEY}")||"light"}catch(e){}`;
