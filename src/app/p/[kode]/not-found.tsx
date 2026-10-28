import Link from "next/link";
import { SearchX } from "lucide-react";
import { waLink, WA_NUMBER } from "@/lib/format";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="batik-pattern h-28" aria-hidden />
      <div className="-mt-10 mx-4 rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-tanah-900/10">
        <SearchX className="mx-auto size-10 text-emas" aria-hidden />
        <h1 className="mt-3 font-display text-2xl text-tanah-700">Produk tidak ditemukan</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Kode pada QR mungkin salah atau produk sudah tidak tersedia. Silakan hubungi CS kami, kami bantu carikan.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={waLink(WA_NUMBER, "Halo Astoetik, QR produk saya tidak terbaca. Bisa dibantu?")}
            className="rounded-xl bg-tanah-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Hubungi CS via WhatsApp
          </a>
          <Link href="/" className="rounded-xl px-4 py-2 text-sm font-medium text-tanah-700 underline-offset-4 hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
