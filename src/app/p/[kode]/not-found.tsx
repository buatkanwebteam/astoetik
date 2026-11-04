import Link from "next/link";
import { SearchX } from "lucide-react";
import { waLink, WA_NUMBER } from "@/lib/format";

export default function ProductNotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-kat-bg px-4 py-16 text-kat-text">
      <div className="w-full max-w-sm text-center">
        <SearchX className="mx-auto size-10 text-aksen-text" aria-hidden />
        <h1 className="mt-4 font-grotesk text-2xl font-bold">Produk tidak ditemukan</h1>
        <p className="mt-2 text-sm text-kat-muted">
          Kode pada QR mungkin salah atau produk sudah tidak tersedia. Silakan hubungi CS kami, kami bantu carikan.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href={waLink(WA_NUMBER, "Halo Astoetik, QR produk saya tidak terbaca. Bisa dibantu?")}
            className="rounded-sm bg-aksen-deep px-4 py-3 font-grotesk text-sm font-semibold text-on-aksen transition-colors duration-150 hover:bg-aksen"
          >
            Hubungi CS via WhatsApp
          </a>
          <Link href="/" className="px-4 py-2 text-sm text-kat-muted underline-offset-4 hover:text-kat-text hover:underline">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
