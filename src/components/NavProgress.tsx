"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/**
 * Thin progress bar at the top of the screen for every internal navigation.
 * It starts on a click on an internal link and finishes when the route changes, so a page that
 * needs a moment to render never looks frozen. DOM-driven (no React state) to avoid extra renders.
 */
function Bar() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const bar = useRef<HTMLDivElement>(null);
  const trickle = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const failsafe = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const width = useRef(0);
  const active = useRef(false);

  const paint = (w: number, opacity: number, fast = false) => {
    const el = bar.current;
    if (!el) return;
    width.current = w;
    el.style.transition = fast ? "width 200ms ease-out, opacity 250ms ease" : "width 400ms ease-out, opacity 250ms ease";
    el.style.width = `${w}%`;
    el.style.opacity = String(opacity);
  };

  const finish = () => {
    if (!active.current) return;
    active.current = false;
    clearInterval(trickle.current);
    clearTimeout(failsafe.current);
    paint(100, 1, true);
    hide.current = setTimeout(() => {
      paint(100, 0);
      hide.current = setTimeout(() => paint(0, 0, true), 300);
    }, 200);
  };

  const start = () => {
    if (active.current) return;
    active.current = true;
    clearTimeout(hide.current);
    paint(0, 1, true);
    requestAnimationFrame(() => paint(12, 1));
    trickle.current = setInterval(() => paint(width.current + (90 - width.current) * 0.12, 1), 250);
    failsafe.current = setTimeout(finish, 15000);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (url.pathname.startsWith("/api/")) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearInterval(trickle.current);
      clearTimeout(failsafe.current);
      clearTimeout(hide.current);
    };
    // start/finish only touch refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The route changed: the new page is on screen.
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  return (
    <div
      ref={bar}
      data-nav-progress
      aria-hidden
      className="no-print pointer-events-none fixed left-0 top-0 z-[200] h-[3px] bg-gradient-to-r from-emas via-hm-gold to-emas opacity-0 shadow-[0_0_10px_rgba(200,146,59,0.7)]"
      style={{ width: 0 }}
    />
  );
}

export function NavProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
