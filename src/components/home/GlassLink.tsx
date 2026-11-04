"use client";

import { useRouter } from "next/navigation";
import { Button } from "glisse";
import type { ReactNode } from "react";

/**
 * Tombol Liquid Glass (glisse) yang berperilaku seperti tautan:
 * "#anchor" -> scroll halus, "/path" -> router, "http..." -> tab baru.
 */
export function GlassLink({
  href,
  children,
  variant = "glass",
  tint,
  icon,
  className,
  "aria-label": ariaLabel,
}: {
  href: string;
  children?: ReactNode;
  variant?: "glass" | "filled";
  tint?: string;
  icon?: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const router = useRouter();

  function go() {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else if (/^https?:/.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  }

  return (
    <Button variant={variant} tint={tint} icon={icon} onClick={go} className={className} aria-label={ariaLabel}>
      {children}
    </Button>
  );
}
