"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FaArrowRight, FaCamera, FaStop } from "react-icons/fa6";
import type { ChatProduct } from "./AskaChat";

interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
type DetectorCtor = new (opts?: { formats?: string[] }) => Detector;

function detectorCtor(): DetectorCtor | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { BarcodeDetector?: DetectorCtor }).BarcodeDetector ?? null;
}

/** Ambil path /p/<kode>[/<seri>] dari isi QR (URL penuh atau path). */
function productPath(text: string): string | null {
  const m = text.match(/\/p\/[^/\s?#]+(?:\/[^/\s?#]+)?/);
  return m ? m[0] : null;
}

/** Panel cek QR: scan lewat kamera, atau masukkan kode model dan nomor seri. */
export function QrCheck({ products }: { products: ChatProduct[] }) {
  const router = useRouter();
  const [code, setCode] = useState(products[0]?.code ?? "");
  const [serial, setSerial] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canScan = useSyncExternalStore(
    () => () => {},
    () => detectorCtor() !== null && !!navigator.mediaDevices?.getUserMedia,
    () => false,
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!scanning) return;
    const Ctor = detectorCtor();
    if (!Ctor) return;
    const detector = new Ctor({ formats: ["qr_code"] });
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        await video.play().catch(() => undefined);
        timer = setInterval(async () => {
          try {
            const found = await detector.detect(video);
            if (!found.length) return;
            const path = productPath(found[0].rawValue);
            if (path) {
              setScanning(false);
              router.push(path);
            } else {
              setError("QR ini bukan QR produk Astoetik.");
            }
          } catch {
            /* frame belum siap, coba lagi */
          }
        }, 350);
      })
      .catch(() => {
        setError("Kamera tidak bisa dibuka. Izinkan akses kamera atau masukkan kode secara manual.");
        setScanning(false);
      });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, router]);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const s = serial.trim();
    if (!code) return;
    if (s && !/^[A-Za-z0-9._-]{1,40}$/.test(s)) {
      setError("Nomor seri hanya boleh huruf, angka, titik, strip, atau garis bawah.");
      return;
    }
    router.push(s ? `/p/${code}/${encodeURIComponent(s)}` : `/p/${code}`);
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-3xl bg-gradient-to-br from-hm-dark/80 via-hm-deep/75 to-hm-deep/85 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.3)] ring-1 ring-white/20 md:p-6">
      <div className="flex gap-2" aria-hidden>
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </div>

      <div data-lenis-prevent className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <p className="text-sm text-hm-gold/80">Pindai QR di produk Anda untuk membuka panduan, spesifikasi, dan bantuan sesuai model.</p>

        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-hm-deep/70 ring-1 ring-white/15">
          {scanning ? (
            <>
              <video ref={videoRef} muted playsInline className="size-full object-cover" />
              <span aria-hidden className="pointer-events-none absolute inset-[18%] rounded-2xl border-2 border-hm-gold/80" />
            </>
          ) : (
            <div className="grid size-full place-items-center p-6 text-center text-sm text-white/60">
              {canScan ? "Arahkan kamera ke QR pada produk." : "Browser ini belum mendukung scan lewat kamera. Gunakan kode di bawah."}
            </div>
          )}
        </div>

        {canScan && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setScanning((v) => !v);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-hm-gold px-5 py-2.5 text-sm font-semibold text-hm-deep transition hover:bg-white"
          >
            {scanning ? <FaStop className="size-3.5" aria-hidden /> : <FaCamera className="size-3.5" aria-hidden />}
            {scanning ? "Berhenti" : "Buka kamera"}
          </button>
        )}

        <form onSubmit={submitManual} className="mt-6 space-y-3 border-t border-white/15 pt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">Atau masukkan manual</p>
          <label className="block text-xs text-white/70">
            Model produk
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-white/25 bg-hm-deep/60 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-hm-gold"
            >
              {products.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/70">
            Nomor seri (opsional, tertera di label produk)
            <input
              value={serial}
              maxLength={40}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Contoh: 0001"
              className="mt-1 block w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-hm-gold"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Buka halaman produk <FaArrowRight className="size-3.5" aria-hidden />
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
