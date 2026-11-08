import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowUpRightFromSquare, FaDownload, FaMagnifyingGlass } from "react-icons/fa6";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { QC_LABEL, nextSerial, warrantyState, warrantyUntil } from "@/lib/units";
import { Card, CardTitle, Chip, ExportLink, PageHeader, mutedText } from "@/components/dashboard/ui";
import { QrGeneratorForm } from "@/components/dashboard/QrGeneratorForm";
import { DeleteQrButton } from "@/components/dashboard/DeleteQrButton";

export const metadata: Metadata = { title: "QR Code" };

const PAGE_SIZE = 20;
const date = (iso: string) => formatDate(`${iso}T00:00:00+07:00`);

export default async function QrPage(props: PageProps<"/dashboard/qr">) {
  const sp = await props.searchParams;
  const db = getDb();
  const products = await db.listProducts();
  const perProduct = await Promise.all(products.map(async (p) => ({ product: p, units: await db.listUnits(p.code) })));

  const all = perProduct
    .flatMap(({ product, units }) => units.map((unit) => ({ product, unit })))
    .sort((a, b) => b.unit.createdAt.localeCompare(a.unit.createdAt));

  const filter = typeof sp.produk === "string" && products.some((p) => p.code === sp.produk) ? sp.produk : null;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 40);
  const byProduct = filter ? all.filter((r) => r.product.code === filter) : all;
  const rows = q ? byProduct.filter((r) => r.unit.serial.toLowerCase().includes(q.toLowerCase())) : byProduct;
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const covered = perProduct.filter((x) => x.units.length > 0).length;

  const href = (patch: { produk?: string | null; page?: number; q?: string }) => {
    const params = new URLSearchParams();
    const p = patch.produk === undefined ? filter : patch.produk;
    if (p) params.set("produk", p);
    const term = patch.q === undefined ? q : patch.q;
    if (term) params.set("q", term);
    if (patch.page && patch.page > 1) params.set("page", String(patch.page));
    const s = params.toString();
    return `/dashboard/qr${s ? `?${s}` : ""}`;
  };

  return (
    <div className="w-full">
      <PageHeader title="QR Code Produk" subtitle="Satu QR untuk satu unit produksi. Scan membuka spesifikasi, FAQ, dan AI chat produk itu." />

      <div className="grid grid-cols-1 gap-3 *:min-w-0 min-[480px]:grid-cols-2 md:grid-cols-3">
        {[
          { label: "Total QR dibuat", value: all.length.toLocaleString("id-ID") },
          { label: "Produk yang sudah punya QR", value: `${covered} dari ${products.length}` },
          { label: "QR terakhir dibuat", value: all[0] ? `${all[0].product.code} - ${all[0].unit.serial}` : "Belum ada" },
        ].map((s) => (
          <Card key={s.label} className="!p-4">
            <p className={`text-xs font-medium ${mutedText}`}>{s.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardTitle>Generate QR baru</CardTitle>
        <QrGeneratorForm
          products={perProduct.map(({ product, units }) => ({ code: product.code, name: product.name, nextSerial: nextSerial(units) }))}
        />
      </Card>

      <Card className="mt-6 !px-3 sm:!px-5">
        <CardTitle
          action={<ExportLink href="/api/qr/all" label="QR per produk (.zip)" />}
        >
          Daftar QR yang sudah dibuat
        </CardTitle>

        <form action="/dashboard/qr" method="get" role="search" className="mb-4 flex max-w-md items-center gap-2">
          {filter && <input type="hidden" name="produk" value={filter} />}
          <div className="relative flex-1">
            <FaMagnifyingGlass aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nomor produksi…"
              aria-label="Cari QR berdasarkan nomor produksi"
              className="block w-full rounded-full border border-tanah-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-ink focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-krem"
            />
          </div>
          <button type="submit" className="rounded-full bg-tanah-900 px-4 py-2.5 text-xs font-semibold text-krem transition hover:bg-tanah-800 dark:bg-emas dark:text-tanah-900">
            Cari
          </button>
          {q && (
            <Link href={href({ q: "" })} className="text-xs font-semibold text-tanah-600 underline dark:text-emas">
              Reset
            </Link>
          )}
        </form>

        <div className="mb-4 flex flex-wrap gap-1.5" aria-label="Filter produk">
          <Chip href={href({ produk: null })} active={!filter}>
            Semua ({all.length})
          </Chip>
          {perProduct
            .filter((x) => x.units.length > 0)
            .map(({ product, units }) => (
              <Chip key={product.code} href={href({ produk: product.code })} active={filter === product.code}>
                {product.code} ({units.length})
              </Chip>
            ))}
        </div>

        {visible.length === 0 ? (
          <p className={`py-8 text-center text-sm ${mutedText}`}>{q ? `Tidak ada QR dengan nomor produksi "${q}".` : "Belum ada QR. Buat yang pertama lewat form di atas."}</p>
        ) : (
          <>
            <ul className="md:hidden" aria-label="Daftar QR">
              {visible.map(({ product, unit }) => {
                const img = `/api/qr/${encodeURIComponent(product.code)}?seri=${encodeURIComponent(unit.serial)}`;
                const btn = "grid size-7 shrink-0 place-items-center rounded-full bg-tanah-50 text-tanah-700 hover:bg-tanah-100 dark:bg-white/10 dark:text-krem sm:size-8";
                return (
                  <li key={`${product.code}-${unit.serial}`} className="flex items-center gap-2 border-b border-tanah-900/10 py-2.5 last:border-0 dark:border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
                    <img
                      src={img}
                      alt={`QR ${product.code} ${unit.serial}`}
                      width={44}
                      height={44}
                      loading="lazy"
                      className="size-10 shrink-0 rounded-lg bg-white p-0.5 ring-1 ring-tanah-900/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 break-words text-[13px] font-medium leading-tight">{product.name}</p>
                      <p className={`mt-0.5 truncate text-[11px] ${mutedText}`}>
                        <span className="font-mono font-semibold text-tanah-700 dark:text-emas">{unit.serial}</span>, {date(unit.productionDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a href={`${img}&download=1`} aria-label={`Unduh QR ${product.code} ${unit.serial}`} className={btn}>
                        <FaDownload className="size-3" aria-hidden />
                      </a>
                      <Link
                        href={`/p/${encodeURIComponent(product.code)}/${encodeURIComponent(unit.serial)}`}
                        target="_blank"
                        aria-label={`Buka halaman ${product.code} ${unit.serial}`}
                        className={btn}
                      >
                        <FaArrowUpRightFromSquare className="size-3" aria-hidden />
                      </Link>
                      <DeleteQrButton code={product.code} serial={unit.serial} compact />
                    </div>
                  </li>
                );
              })}
            </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm md:min-w-[760px]">
              <thead>
                <tr className={`border-b border-tanah-900/10 text-left text-xs dark:border-white/10 ${mutedText}`}>
                  <th scope="col" className="py-2 font-medium">QR</th>
                  <th scope="col" className="py-2 font-medium">Produk</th>
                  <th scope="col" className="py-2 font-medium">Nomor produksi</th>
                  <th scope="col" className="hidden py-2 font-medium sm:table-cell">Tanggal produksi</th>
                  <th scope="col" className="hidden py-2 font-medium md:table-cell">Garansi</th>
                  <th scope="col" className="hidden py-2 font-medium md:table-cell">QC</th>
                  <th scope="col" className="py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ product, unit }) => {
                  const img = `/api/qr/${encodeURIComponent(product.code)}?seri=${encodeURIComponent(unit.serial)}`;
                  const until = warrantyUntil(unit);
                  const ws = warrantyState(unit);
                  return (
                    <tr key={`${product.code}-${unit.serial}`} className="border-b border-tanah-900/5 last:border-0 dark:border-white/5">
                      <td className="py-2.5 pr-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
                        <img
                          src={img}
                          alt={`QR ${product.code} ${unit.serial}`}
                          width={56}
                          height={56}
                          loading="lazy"
                          className="size-14 rounded-lg bg-white p-0.5 ring-1 ring-tanah-900/10"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{product.name}</p>
                        <p className={`font-mono text-xs ${mutedText}`}>{product.code}</p>
                      </td>
                      <td className="py-2.5 pr-3 font-mono">{unit.serial}</td>
                      <td className="hidden py-2.5 pr-3 sm:table-cell">{date(unit.productionDate)}</td>
                      <td className="hidden py-2.5 pr-3 text-xs md:table-cell">
                        {ws === "tidak-ada" ? (
                          <span className={mutedText}>Tanpa garansi</span>
                        ) : (
                          <>
                            {unit.warrantyMonths} bln
                            <span className={`block ${mutedText}`}>
                              {ws === "aktif" ? "s/d" : "berakhir"} {date(until!)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="hidden py-2.5 pr-3 text-xs md:table-cell">{QC_LABEL.lulus}</td>
                      <td className="py-2.5 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <a
                            href={`${img}&download=1`}
                            aria-label={`Unduh QR ${product.code} ${unit.serial}`}
                            className="grid size-8 place-items-center rounded-full bg-tanah-50 text-tanah-700 hover:bg-tanah-100 dark:bg-white/10 dark:text-krem"
                          >
                            <FaDownload className="size-3" aria-hidden />
                          </a>
                          <Link
                            href={`/p/${encodeURIComponent(product.code)}/${encodeURIComponent(unit.serial)}`}
                            target="_blank"
                            aria-label={`Buka halaman ${product.code} ${unit.serial}`}
                            className="grid size-8 place-items-center rounded-full bg-tanah-50 text-tanah-700 hover:bg-tanah-100 dark:bg-white/10 dark:text-krem"
                          >
                            <FaArrowUpRightFromSquare className="size-3" aria-hidden />
                          </Link>
                          <DeleteQrButton code={product.code} serial={unit.serial} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {pages > 1 && (
          <nav aria-label="Halaman" className="mt-4 flex items-center justify-between text-xs">
            <span className={mutedText}>
              Halaman {page} dari {pages}
            </span>
            <div className="flex gap-1.5">
              {page > 1 && (
                <Chip href={href({ page: page - 1 })} active>
                  Sebelumnya
                </Chip>
              )}
              {page < pages && (
                <Chip href={href({ page: page + 1 })} active>
                  Berikutnya
                </Chip>
              )}
            </div>
          </nav>
        )}
      </Card>
    </div>
  );
}
