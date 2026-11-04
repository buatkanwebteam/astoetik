"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

// Sumber: infografis "10 Tahun Perjalanan Astoetik" (referensi_website.html#about-history).
interface Stop {
  year: string;
  wide?: boolean;
  items: { text: string; span?: string }[];
}

const STOPS: Stop[] = [
  { year: "2019", items: [{ text: "Pendirian CV. Astoetik" }] },
  {
    year: "2021",
    wide: true,
    items: [
      { text: "Riset Alat Pen Plotter Batik kerjasama UNY" },
      { text: "Riset Alat Pengolah Limbah Batik Portabel kerjasama BBKB", span: "2021–2023" },
      { text: "Perpanjangan SNI dan ISO 9001:2015" },
      { text: "Astoetik homestay sebagai pelengkap sanggar batik" },
    ],
  },
  {
    year: "2022",
    items: [
      { text: "Sertifikasi TKDN untuk 16 produk", span: "2022–2023" },
      { text: "Produk Astoetik dapat diakses di e-katalog" },
    ],
  },
  {
    year: "2023",
    wide: true,
    items: [
      { text: "Astoetik sudah bisa pelatihan berbasis kompetensi BNSP" },
      { text: "Apresiasi Entredev Kemenkop UKM" },
      { text: "SNI Award Kategori Perunggu" },
    ],
  },
];

const GROUND = "13vh"; // tinggi garis tanah dari bawah layar

function Card({ text, span, i }: { text: string; span?: string; i: number }) {
  // Satu warna seragam untuk semua kartu (tanpa lapisan kaca), supaya tidak ada yang tampak berbeda.
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
      className="rounded-xl bg-gradient-to-br from-[#f3d794] to-[#e3b869] px-3 py-2.5 text-hm-deep shadow-[0_6px_16px_-8px_rgba(62,36,20,.5),inset_0_1px_0_rgba(255,255,255,.55)] ring-1 ring-white/50"
    >
      {span && <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-hm-mid">{span}</p>}
      <p className="text-xs font-medium leading-snug md:text-sm">{text}</p>
    </motion.li>
  );
}

const TIP_X = "clamp(120px, 20vw, 340px)"; // posisi ujung canting di layar

// Gambar canting (public/home/canting.webp): ujung cucuk ada di (12.1%, 83.8%) gambar.
const CANT_W = 220;
const CANT_H = Math.round(CANT_W * 0.714);
const TIP_FX = 0.121;
const TIP_FY = 0.838;

/** Canting yang "menulis" garis waktu: jejak malam tertinggal di kiri ujungnya. */
function Canting({ progress }: { progress: MotionValue<number> }) {
  const phase = useTransform(progress, (v) => v * Math.PI * 2 * 26);
  const tilt = useTransform(phase, (p) => Math.sin(p) * 3);
  const lift = useTransform(phase, (p) => Math.sin(p * 0.5) * 3);

  return (
    <>
      <div className="absolute left-0 h-[5px] rounded-r-full bg-hm-dark" style={{ bottom: GROUND, width: TIP_X }} aria-hidden />
      <motion.img
        src="/home/canting.webp"
        alt=""
        width={CANT_W}
        height={CANT_H}
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: CANT_W,
          height: CANT_H,
          left: `calc(${TIP_X} - ${Math.round(CANT_W * TIP_FX)}px)`,
          bottom: `calc(${GROUND} - ${Math.round(CANT_H * (1 - TIP_FY))}px + 2px)`,
          rotate: tilt,
          y: lift,
          transformOrigin: `${TIP_FX * 100}% ${TIP_FY * 100}%`,
        }}
      />
    </>
  );
}

function StaticList() {
  return (
    <section id="sejarah" className="w-full bg-[url(/home/batik-bg.jpg)] bg-cover bg-center px-4 py-20 text-hm-deep md:px-6">
      <h2 className="font-display text-5xl font-medium tracking-[-0.03em]">10 Tahun Perjalanan Astoetik</h2>
      <div className="mt-10 space-y-10">
        {STOPS.map((s) => (
          <div key={s.year}>
            <p className="font-display text-4xl text-hm-mid">{s.year}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {s.items.map((it, i) => (
                <Card key={it.text} {...it} i={i} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Timeline({ about }: { about?: ReactNode }) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });
  const x = useTransform(progress, [0, 1], [0, -shift]);
  const bar = useTransform(progress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (track.current) setShift(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  if (reduce) return (
      <div id="tentang">
        {about}
        <StaticList />
      </div>
    );

  return (
    <section id="tentang" ref={outer} className="relative h-[430vh] w-full bg-[#fbf6ee] text-hm-deep">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#fbf6ee] bg-[url(/home/batik-bg.jpg)] bg-cover bg-center">
        <div className="absolute inset-x-0 top-0 z-20 h-1 bg-hm-dark/10">
          <motion.div className="h-full bg-hm-mid" style={{ width: bar }} />
        </div>

        {/* Atas: Tentang. Bawah: timeline. Satu layar. */}
        <div className="absolute inset-x-0 top-0 z-10">{about}</div>

        <motion.div ref={track} style={{ x }} className="absolute left-0 top-0 flex h-full w-max items-stretch pl-[36vw] pr-[40vw] md:pl-[32vw]">
          {/* Garis tanah bermotif putus-putus: ikut bergeser, jadi terasa seperti berjalan */}
          <div
            className="absolute inset-x-0 h-[3px]"
            style={{
              bottom: GROUND,
              backgroundImage: "repeating-linear-gradient(90deg,#3e241440 0 28px,transparent 28px 52px)",
            }}
          />

          <div className="flex h-full w-[78vw] shrink-0 flex-col justify-end pr-8 md:w-[40vw]" style={{ paddingBottom: `calc(${GROUND} + 30px)` }}>
            <p className="text-sm uppercase tracking-[0.25em] text-hm-mid">Jejak perjalanan</p>
            <h2 className="mt-2 font-display text-4xl font-medium leading-[0.95] tracking-[-0.04em] md:text-6xl">
              10 Tahun
              <br />
              Perjalanan
              <br />
              Astoetik
            </h2>
          </div>

          {STOPS.map((s) => (
            <div
              key={s.year}
              className={`relative flex h-full shrink-0 flex-col justify-end pr-10 ${s.wide ? "w-[88vw] md:w-[56vw]" : "w-[78vw] md:w-[34vw]"}`}
              style={{ paddingBottom: `calc(${GROUND} + 30px)` }}
            >
              <ul className={`grid gap-2 ${s.wide ? "md:grid-cols-2" : ""}`}>
                {s.items.map((it, i) => (
                  <Card key={it.text} {...it} i={i} />
                ))}
              </ul>
              <span
                className="absolute left-0 size-4 rounded-full border-[3px] border-[#fbf6ee] bg-hm-dark"
                style={{ bottom: `calc(${GROUND} - 6.5px)` }}
                aria-hidden
              />
              <p className="absolute left-0 font-display text-3xl font-medium text-hm-mid md:text-4xl" style={{ bottom: `calc(${GROUND} - 3.4rem)` }}>
                {s.year}
              </p>
            </div>
          ))}

          <div className="flex h-full w-[70vw] shrink-0 flex-col justify-end md:w-[34vw]" style={{ paddingBottom: `calc(${GROUND} + 30px)` }}>
            <p className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">Perjalanan masih berlanjut.</p>
          </div>
        </motion.div>

        <Canting progress={progress} />
      </div>
    </section>
  );
}
