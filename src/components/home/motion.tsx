"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ElementType } from "react";

/** Teks muncul kata demi kata (opacity + blur) saat masuk viewport. */
export function WordReveal({
  text,
  className = "",
  as = "h2",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={reduce ? false : { opacity: 0.15, filter: "blur(2px)" }}
          animate={inView || reduce ? { opacity: 1, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.5, delay: delay + i * 0.06, ease: "easeOut" }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}

/** Angka berjalan dari `from` ke `to` saat terlihat. */
export function AnimatedCounter({
  from = 0,
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "id-ID",
  className,
}: {
  from?: number;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : from);

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(from, to, { duration: 1.6, ease: "easeOut", onUpdate: setVal });
    return () => c.stop();
  }, [inView, reduce, from, to]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
