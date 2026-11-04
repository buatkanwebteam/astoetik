"use client";

import { useEffect, useState } from "react";
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
function PersonCard({ p, tone }: { p: OrgPerson; tone: Tone }) {
  const Icon = ICONS[p.icon];
  const t = TONE[tone];
  return (
    <div className="relative mx-auto h-full w-full max-w-[17rem] pt-9">
      <div className={`flex h-full flex-col items-center rounded-[2.75rem] border bg-white px-5 pb-5 pt-12 text-center ${t.border}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${t.text}`}>{p.title}</p>
        <p className="mt-1 text-base font-bold leading-snug text-[#141414]">{p.name}</p>

        {p.desc && (
          <ul className="mt-2 space-y-1 text-[11px] leading-snug text-hm-muted">
            {p.desc.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {p.members && (
          <ul className="mt-2 space-y-0.5 text-[11px] leading-snug text-hm-muted">
            {p.members.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        {p.subs && (
          <div className="mt-2 space-y-1.5 text-[11px] leading-snug text-hm-muted">
            {p.subs.map((s) => (
              <p key={s.label}>
                <span className="font-semibold text-hm-dark">Sub-bagian {s.label}: </span>
                {s.members.join(", ")}
              </p>
            ))}
          </div>
        )}
        <Icon className={`mt-auto pt-4 size-9 ${t.text} opacity-80`} aria-hidden />
      </div>
      <span className="absolute left-1/2 top-0 grid size-[4.5rem] -translate-x-1/2 place-items-center rounded-full bg-gradient-to-b from-white to-[#e9e4dc] text-lg font-semibold text-[#3D2A1C] shadow-[0_8px_18px_-4px_rgba(61,42,28,.45),inset_0_-3px_6px_rgba(61,42,28,.12)]">
        {initials(p.name)}
      </span>
    </div>
  );
}

const line = "absolute bg-[#3D2A1C]/50";

/** Penghubung siku antar level (desktop). Posisi dalam % dari 4 kolom sama lebar. */
function Connector({ top, bottom, spanFrom, spanTo }: { top: number[]; bottom: number[]; spanFrom: number; spanTo: number }) {
  return (
    <div className="relative h-10" aria-hidden>
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
          <PersonCard p={komisaris} tone="dark" />
        </div>
        <div className="col-start-3">
          <PersonCard p={direktur} tone="dark" />
        </div>
      </div>
      <Connector top={[37.5, 62.5]} bottom={[12.5, 50]} spanFrom={12.5} spanTo={62.5} />
      <div className="grid grid-cols-4">
        <div className="col-start-1">
          <PersonCard p={finance} tone="mid" />
        </div>
        <div className="col-span-2 col-start-2">
          <PersonCard p={ops} tone="mid" />
        </div>
      </div>
      <Connector top={[50]} bottom={[12.5, 37.5, 62.5, 87.5]} spanFrom={12.5} spanTo={87.5} />
      <div className="grid grid-cols-4 gap-0">
        {ORG_DIVISIONS.map((p) => (
          <div key={p.title} className="px-2">
            <PersonCard p={p} tone="gold" />
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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
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

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Struktur organisasi Astoetik"
          className="fixed inset-0 z-[100] grid place-items-center bg-hm-deep/40 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div data-lenis-prevent className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 text-[#141414] shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-hm-dark/20 hover:bg-white"
            >
              <FaXmark className="size-4" />
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-hm-mid">Tim kami</p>
            <h2 className="mb-6 mt-1 font-display text-3xl font-medium tracking-[-0.03em] md:text-4xl">Struktur Organisasi Astoetik</h2>

            <Tree />
            <Stack />
          </div>
        </div>
      )}
    </>
  );
}
