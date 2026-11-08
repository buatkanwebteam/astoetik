"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Count-up number, modelled on the reactbits.dev "CountUp" component:
 * a spring-driven motion value written straight to the DOM node (no re-render per frame).
 */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.4,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 20 + 40 * (1 / duration), stiffness: 100 * (1 / duration) });
  const inView = useInView(ref, { once: true, margin: "0px" });

  const fmt = (n: number) =>
    `${n.toLocaleString("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

  useEffect(() => {
    if (ref.current) ref.current.textContent = fmt(reduce ? to : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inView) motionValue.set(to);
  }, [inView, to, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current && !reduce) ref.current.textContent = fmt(latest);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spring, reduce, decimals, suffix]);

  useEffect(() => {
    if (reduce && ref.current) ref.current.textContent = fmt(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, to, decimals, suffix]);

  return <span ref={ref} className={className} aria-label={fmt(to)} />;
}

/**
 * Cursor-following radial glow, modelled on the reactbits.dev "SpotlightCard".
 * The glow layer is purely decorative and never takes pointer events.
 */
export function SpotlightCard({
  children,
  className = "",
  spotlight = "rgba(200,146,59,0.22)",
}: {
  children: ReactNode;
  className?: string;
  spotlight?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sx", `${e.clientX - r.left}px`);
        el.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      onPointerLeave={() => ref.current?.style.setProperty("--so", "0")}
      onPointerEnter={() => ref.current?.style.setProperty("--so", "1")}
      className={`group/spot relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[var(--so,0)] transition-opacity duration-300"
        style={{ background: `radial-gradient(260px circle at var(--sx,50%) var(--sy,50%), ${spotlight}, transparent 70%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
