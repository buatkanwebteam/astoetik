import Image from "next/image";

/** Shown while a page renders on the server (first load, login to dashboard, and so on). */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid min-h-dvh flex-1 place-items-center bg-hm-deep">
      <div className="flex flex-col items-center gap-6">
        <Image src="/home/logo-astoetik.png" alt="Astoetik" width={563} height={278} priority className="h-16 w-auto animate-pulse motion-reduce:animate-none" />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/15">
          <div className="h-full w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] rounded-full bg-emas motion-reduce:animate-none" />
        </div>
        <span className="sr-only">Memuat halaman</span>
      </div>
    </div>
  );
}
