"use client";

import GlideSelect from "./GlideSelect";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * App-wide dropdown (React Bits Glide Select). "light" follows the kat-* tokens, so it also
 * works in dashboard dark mode; "dark" is for the glass cards on the landing page.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  ariaLabel,
  disabled,
  variant = "light",
  size = "lg",
  corner,
  flip,
  maxMenuHeight,
  fullWidth = true,
  align,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  ariaLabel: string;
  disabled?: boolean;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "field";
  /** Corner radius in px, so the dropdown matches the inputs beside it. */
  corner?: number;
  /** Set false to always open downward. */
  flip?: boolean;
  /** Max menu height in px; longer lists scroll. */
  maxMenuHeight?: number;
  fullWidth?: boolean;
  align?: "left" | "right";
  className?: string;
}) {
  const dark = variant === "dark";
  return (
    <GlideSelect
      id={id}
      options={options}
      value={value}
      onChange={(v) => onChange(v)}
      ariaLabel={ariaLabel}
      disabled={disabled}
      size={size}
      align={align}
      fullWidth={fullWidth}
      menuWidth={fullWidth ? 0 : 224}
      radius={corner !== undefined ? corner + 4 : dark ? 999 : 16}
      triggerRadius={corner ?? (dark ? 999 : 12)}
      flip={flip}
      maxMenuHeight={maxMenuHeight}
      focusRing={!dark}
      surfaceColor={dark ? "#2a190e" : "var(--color-kat-card)"}
      highlightColor={dark ? "#4a3020" : "var(--color-kat-raised)"}
      textColor={dark ? "#ffffff" : "var(--color-kat-text)"}
      accentColor={dark ? "#f0cf8a" : "var(--color-aksen)"}
      triggerClassName={dark ? "ring-1 ring-white/25" : "ring-1 ring-kat-line"}
      className={className}
    />
  );
}
