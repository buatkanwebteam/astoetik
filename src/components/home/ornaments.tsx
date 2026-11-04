import type { CSSProperties } from "react";

const GOLD = "#d4af37";

/** Tekstur serat kain halus (noise SVG), dipakai sebagai lapisan di atas gradien coklat. */
export const FABRIC_TEXTURE: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85 .35' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 .83  0 0 0 0 .69  0 0 0 0 .22  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  backgroundSize: "180px 180px",
};

/** Garis tepi ganda emas tipis: border luar di wrapper, garis dalam lewat komponen ini. */
export function InnerBorder() {
  return <div className="pointer-events-none absolute inset-1.5 rounded-[18px] border border-[#d4af37]/20" aria-hidden />;
}

/** Motif Parang (pita diagonal berlekuk) yang memudar ke arah dalam kartu. */
export function ParangCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={`pointer-events-none absolute ${className}`}
      style={{ maskImage: "radial-gradient(circle at 100% 0%, #000 0%, transparent 72%)", WebkitMaskImage: "radial-gradient(circle at 100% 0%, #000 0%, transparent 72%)" }}
      fill="none"
      stroke={GOLD}
      strokeLinecap="round"
      aria-hidden
    >
      <defs>
        <pattern id="parang" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
          <path d="M-4 16 C6 0 14 0 20 12 S30 28 36 16" strokeWidth="2.2" opacity=".9" />
          <path d="M-4 30 C6 14 14 14 20 26 S30 42 36 30" strokeWidth="1.2" opacity=".55" />
          <circle cx="10" cy="24" r="1.6" fill={GOLD} stroke="none" opacity=".7" />
        </pattern>
      </defs>
      <rect width="160" height="160" fill="url(#parang)" />
    </svg>
  );
}

/** Aliran gelombang / mega mendung di sudut kiri bawah. */
export function MegaWave({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 150"
      className={`pointer-events-none absolute ${className}`}
      style={{ maskImage: "radial-gradient(circle at 0% 100%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(circle at 0% 100%, #000 0%, transparent 75%)" }}
      fill="none"
      stroke={GOLD}
      strokeLinecap="round"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M-10 ${150 - i * 22} C30 ${120 - i * 22} 50 ${178 - i * 22} 95 ${146 - i * 22} S160 ${112 - i * 22} 230 ${140 - i * 22}`}
          strokeWidth={2.4 - i * 0.3}
          opacity={0.85 - i * 0.14}
        />
      ))}
      <path d="M20 128 c8-16 26-16 30-2 c-10-4-20 0-30 2z" fill={GOLD} stroke="none" opacity=".35" />
      <path d="M70 100 c8-14 24-14 28-2 c-9-3-19 0-28 2z" fill={GOLD} stroke="none" opacity=".25" />
    </svg>
  );
}

/** Cincin motif Kawung (empat elips bertumpuk) untuk membingkai ikon. */
export function KawungRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`pointer-events-none absolute ${className}`} fill="none" stroke={GOLD} aria-hidden>
      <circle cx="40" cy="40" r="38" strokeWidth="1" opacity=".5" />
      <circle cx="40" cy="40" r="33" strokeWidth=".8" strokeDasharray="2 3" opacity=".6" />
      {[0, 90].map((r) => (
        <g key={r} transform={`rotate(${r} 40 40)`}>
          <ellipse cx="40" cy="22" rx="7" ry="13" strokeWidth=".9" opacity=".7" />
          <ellipse cx="40" cy="58" rx="7" ry="13" strokeWidth=".9" opacity=".7" />
        </g>
      ))}
    </svg>
  );
}
