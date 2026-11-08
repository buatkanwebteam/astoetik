import Link from "next/link";
import { FaMagnifyingGlass, FaWhatsapp } from "react-icons/fa6";
import { waLink, WA_NUMBER } from "@/lib/format";

export default function ProductNotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-gradient-to-br from-tanah-900 via-tanah-800 to-tanah-600 px-4 py-16 text-krem">
      <div className="glossy-dark w-full max-w-sm rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/15 backdrop-blur">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 text-hm-gold">
          <FaMagnifyingGlass className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">Produk tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-krem/70">
          Kode pada QR mungkin salah atau produk sudah tidak tersedia. Silakan hubungi CS kami, kami bantu carikan.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href={waLink(WA_NUMBER, "Halo Astoetik, QR produk saya tidak terbaca. Bisa dibantu?")}
            className="flex items-center justify-center gap-2 rounded-full bg-hm-gold px-5 py-3 text-sm font-semibold text-tanah-900 transition hover:bg-white"
          >
            <FaWhatsapp className="size-[18px]" aria-hidden />
            Hubungi CS via WhatsApp
          </a>
          <Link href="/" className="px-4 py-2 text-sm text-krem/70 underline-offset-4 hover:text-krem hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
