"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaBoxesStacked, FaBullhorn, FaCoins, FaGears, FaIndustry, FaLaptopCode, FaUserTie, FaXmark, FaScaleBalanced } from "react-icons/fa6";
import { ORG_DIVISIONS, ORG_SUPPORT, ORG_TOP, type OrgPerson } from "@/data/org";

const ICONS = {
  direktur: FaUserTie,
  komisaris: FaScaleBalanced,
  finance: FaCoins,
  ops: FaGears,
  sales: FaBullhorn,
  produksi: FaBoxesStacked,
  ri: FaIndustry,
  it: FaLaptopCode,
} as const;

type Tone = "dark" | "mid" | "gold";
const TONE: Record<Tone, { border: string; text: string }> = {
  dark: { border: "border-[#3D2A1C]", text: "text-[#3D2A1C]" },
  mid: { border: "border-hm-mid", text: "text-hm-mid" },
  gold: { border: "border-[#c99a3c]", text: "text-[#a97c1f]" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

/** Kartu kapsul: avatar bulat timbul di atas, garis tipis, ikon peran di bawah. */
function PersonCard({ p, tone, compact = false }: { p: OrgPerson; tone: Tone; compact?: boolean }) {
  const Icon = ICONS[p.icon];
  const t = TONE[tone];
  return (
    <div className={`relative mx-auto h-full w-full ${compact ? "max-w-[15rem] pt-6" : "max-w-[17rem] pt-9"}`}>
      <div className={`flex h-full flex-col items-center border bg-white text-center ${compact ? "rounded-3xl px-3 pb-2.5 pt-8" : "rounded-[2.75rem] px-5 pb-5 pt-12"} ${t.border}`}>
        <p className={`font-semibold uppercase tracking-[0.08em] ${compact ? "text-[9px]" : "text-[11px]"} ${t.text}`}>{p.title}</p>
        <p className={`mt-0.5 font-bold leading-snug text-[#141414] ${compact ? "text-xs" : "mt-1 text-base"}`}>{p.name}</p>

        {p.desc && (
          <ul className={`mt-1.5 space-y-0.5 ${compact ? "text-[9px]" : "text-[11px]"} leading-snug text-hm-muted`}>
            {p.desc.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {p.members && (
          <ul className={`mt-1.5 space-y-0.5 ${compact ? "text-[9px]" : "text-[11px]"} leading-snug text-hm-muted`}>
            {p.members.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        {p.subs && (
          <div className={`mt-1.5 space-y-1 ${compact ? "text-[9px]" : "text-[11px]"} leading-snug text-hm-muted`}>
            {p.subs.map((s) => (
              <p key={s.label}>
                <span className="font-semibold text-hm-dark">Sub-bagian {s.label}: </span>
                {s.members.join(", ")}
              </p>
            ))}
          </div>
        )}
        <Icon className={`mt-auto ${compact ? "pt-2 size-6" : "pt-4 size-9"} ${t.text} opacity-80`} aria-hidden />
      </div>
      <span className={`absolute left-1/2 top-0 grid -translate-x-1/2 place-items-center rounded-full bg-gradient-to-b from-white to-[#e9e4dc] font-semibold ${compact ? "size-11 text-sm" : "size-[4.5rem] text-lg"} text-[#3D2A1C] shadow-[0_8px_18px_-4px_rgba(61,42,28,.45),inset_0_-3px_6px_rgba(61,42,28,.12)]`}>
        {initials(p.name)}
      </span>
    </div>
  );
}

const line = "absolute bg-[#3D2A1C]/50";

/** Penghubung siku antar level (desktop). Posisi dalam % dari 4 kolom sama lebar. */
function Connector({ top, bottom, spanFrom, spanTo }: { top: number[]; bottom: number[]; spanFrom: number; spanTo: number }) {
  return (
    <div className="relative h-5" aria-hidden>
      {top.map((x) => (
        <span key={`t${x}`} className={`${line} top-0 h-1/2 w-px`} style={{ left: `${x}%` }} />
      ))}
      <span className={`${line} top-1/2 h-px`} style={{ left: `${spanFrom}%`, width: `${spanTo - spanFrom}%` }} />
      {bottom.map((x) => (
        <span key={`b${x}`} className={`${line} bottom-0 h-1/2 w-px`} style={{ left: `${x}%` }} />
      ))}
    </div>
  );
}

function Tree() {
  const [komisaris, direktur] = ORG_TOP;
  const [finance, ops] = ORG_SUPPORT;
  return (
    <div className="hidden lg:block">
      <div className="grid grid-cols-4">
        <div className="col-start-2">
          <PersonCard p={komisaris} tone="dark" compact />
        </div>
        <div className="col-start-3">
          <PersonCard p={direktur} tone="dark" compact />
        </div>
      </div>
      <Connector top={[37.5, 62.5]} bottom={[12.5, 50]} spanFrom={12.5} spanTo={62.5} />
      <div className="grid grid-cols-4">
        <div className="col-start-1">
          <PersonCard p={finance} tone="mid" compact />
        </div>
        <div className="col-span-2 col-start-2">
          <PersonCard p={ops} tone="mid" compact />
        </div>
      </div>
      <Connector top={[50]} bottom={[12.5, 37.5, 62.5, 87.5]} spanFrom={12.5} spanTo={87.5} />
      <div className="grid grid-cols-4 gap-0">
        {ORG_DIVISIONS.map((p) => (
          <div key={p.title} className="px-1.5">
            <PersonCard p={p} tone="gold" compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function Level({ label }: { label: string }) {
  return (
    <p className="mb-2 mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-hm-mid first:mt-0">{label}</p>
  );
}

function Stack() {
  return (
    <div className="lg:hidden">
      <Level label="Pimpinan Utama" />
      <div className="grid gap-4 sm:grid-cols-2">
        {ORG_TOP.map((p) => (
          <PersonCard key={p.title} p={p} tone="dark" />
        ))}
      </div>
      <Level label="Pendukung & Operasional" />
      <div className="grid gap-4 sm:grid-cols-2">
        {ORG_SUPPORT.map((p) => (
          <PersonCard key={p.title} p={p} tone="mid" />
        ))}
      </div>
      <Level label="Divisi Pelaksana" />
      <div className="grid gap-4 sm:grid-cols-2">
        {ORG_DIVISIONS.map((p) => (
          <PersonCard key={p.title} p={p} tone="gold" />
        ))}
      </div>
    </div>
  );
}

export function OrgModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-hm-dark/25 bg-white/50 px-6 py-2.5 text-sm font-medium text-hm-dark backdrop-blur transition hover:bg-white"
      >
        Tim Kami
      </button>

      {open &&
        createPortal(
        <div
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Struktur organisasi Astoetik"
          className="fixed inset-0 z-[9999] grid place-items-center overscroll-contain bg-hm-deep/40 p-3 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div data-lenis-prevent className="relative max-h-[96vh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 text-[#141414] shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-hm-dark/20 hover:bg-white"
            >
              <FaXmark className="size-4" />
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-hm-mid">Tim kami</p>
            <h2 className="mb-3 mt-0.5 font-display text-2xl font-medium tracking-[-0.03em] md:text-3xl">Struktur Organisasi Astoetik</h2>

            <Tree />
            <Stack />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
