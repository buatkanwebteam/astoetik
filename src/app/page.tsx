import Image from "next/image";
import Link from "next/link";
import { BarChart3, LogIn, QrCode, Sparkles } from "lucide-react";
import { getDb } from "@/lib/db";
import { formatRupiah } from "@/lib/format";

export const revalidate = 3600;

export default async function Home() {
  const products = await getDb().listProducts();

  return (
    <main className="flex-1">
      <section className="batik-pattern px-5 pb-16 pt-6 text-krem">
        <div className="mx-auto max-w-5xl">
          <nav className="flex items-center justify-between">
            <span className="font-display text-xl tracking-wide">ASTOETIK</span>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full bg-krem px-4 py-2 text-sm font-semibold text-tanah-700 transition hover:bg-white"
            >
              <LogIn className="size-4" aria-hidden />
              Login Admin
            </Link>
          </nav>
          <div className="mt-14 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-emas">ASTERA-X</p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              Dari kompor di sanggar, ke data di dashboard.
            </h1>
            <p className="mt-4 text-base text-krem/85">
              Platform CV. Astoetik Indonesia untuk menghubungkan pembatik dengan produknya lewat QR, dan membantu tim memahami
              pasar lewat analitik serta AI.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 grid max-w-5xl gap-4 px-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-tanah-900/10">
          <QrCode className="size-7 text-emas" aria-hidden />
          <h2 className="mt-3 font-display text-xl text-tanah-700">Scan QR to Website</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Setiap produk punya QR. Pindai dengan kamera HP untuk melihat spesifikasi, FAQ, dan bertanya ke asisten AI.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-tanah-900/10">
          <BarChart3 className="size-7 text-emas" aria-hidden />
          <h2 className="mt-3 font-display text-xl text-tanah-700">Dashboard Analytics</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Funnel pelanggan, konten terbaik, perencana konten, dan ringkasan pertanyaan pelanggan dengan bantuan AI.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="size-5 text-emas" aria-hidden />
          <h2 className="font-display text-2xl text-tanah-700">Coba halaman produk</h2>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <li key={p.code}>
              <Link
                href={`/p/${p.code}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-tanah-900/10 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3]">
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-mono text-[11px] text-tanah-500">{p.code}</p>
                  <p className="line-clamp-2 text-sm font-medium text-ink">{p.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">{formatRupiah(p.price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="batik-pattern-light border-t border-tanah-900/10 py-6 text-center text-xs text-ink-soft">
        © CV. Astoetik Indonesia · Jeblog, Tirtonirmolo, Kasihan, Bantul, DIY
      </footer>
    </main>
  );
}
