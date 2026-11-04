"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Download, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { Product, ProductCategory } from "@/types";

export const PRODUCT_FORM_ID = "product-form";

// Labels the catalogue filters read (see lib/catalog.ts). Offered as suggestions
// so new products land in the right Bahan / Daya / Kontrol facets.
const SPEC_LABELS = [
  "Bahan Bodi",
  "Bahan Bodi Canting",
  "Bahan Gagang",
  "Handle",
  "Daya",
  "Daya Maks",
  "Tegangan",
  "Kontrol Panas",
  "Pengaturan",
  "Tinggi",
  "Diameter",
  "Ukuran",
  "Berat",
  "Model",
  "Panjang Gagang",
  "Kapasitas Baterai",
];

const MAX_SIDE = 1200;

/** Downscales in the browser so the stored data URL stays small (~100–250 KB). */
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff"; // transparent PNGs would turn black as JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

interface SpecRow {
  id: number;
  label: string;
  value: string;
}

const input =
  "h-10 w-full rounded-sm border border-kat-line bg-kat-card px-3 text-sm text-kat-text placeholder:text-kat-muted/70 transition-colors duration-150 focus:border-aksen focus:outline-none disabled:bg-kat-raised disabled:text-kat-muted";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-kat-text">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-kat-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-b border-kat-line px-5 py-6 last:border-0">
      <legend className="sr-only">{title}</legend>
      <p className="font-grotesk text-sm font-semibold text-kat-text" aria-hidden>
        {title}
      </p>
      {children}
    </fieldset>
  );
}

export function ProductForm({
  product,
  categoryLabel,
  siteUrl,
  onSubmittingChange,
  onSaved,
  onError,
}: {
  /** null = create a new product. */
  product: Product | null;
  categoryLabel: Record<ProductCategory, string>;
  siteUrl: string;
  onSubmittingChange: (busy: boolean) => void;
  onSaved: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const nextId = useRef(product?.specs.length ?? 1);
  const [code, setCode] = useState(product?.code ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "kompor");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specs.length ? product.specs.map((s, id) => ({ id, ...s })) : [{ id: 0, label: "", value: "" }],
  );
  const [sni, setSni] = useState(product?.sni ?? false);
  const [note, setNote] = useState(product?.note ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [shopee, setShopee] = useState(product?.marketplaceLinks.shopee ?? "");
  const [tokopedia, setTokopedia] = useState(product?.marketplaceLinks.tokopedia ?? "");
  const [photoBusy, setPhotoBusy] = useState(false);

  const patchSpec = (id: number, patch: Partial<SpecRow>) =>
    setSpecs((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      onError("Foto harus JPG, PNG, atau WebP.");
      return;
    }
    setPhotoBusy(true);
    try {
      setImage(await fileToDataUrl(file));
      onError(null);
    } catch {
      onError("Foto tidak bisa dibaca. Coba file lain.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function submit() {
    const filled = specs.filter((s) => s.label.trim() || s.value.trim());
    if (filled.some((s) => !s.label.trim() || !s.value.trim())) {
      onError("Lengkapi label dan nilai pada setiap baris spesifikasi, atau hapus barisnya.");
      return;
    }
    if (!image) {
      onError("Foto produk wajib diunggah.");
      return;
    }
    const priceNum = Number(price);
    if (price.trim() === "" || !Number.isInteger(priceNum)) {
      onError("Harga wajib diisi dengan angka bulat (tanpa titik).");
      return;
    }

    const body = {
      ...(product ? {} : { code }),
      name,
      category,
      price: priceNum,
      specs: filled.map(({ label, value }) => ({ label: label.trim(), value: value.trim() })),
      sni,
      note: note.trim() || null,
      image,
      marketplaceLinks: { shopee: shopee.trim(), tokopedia: tokopedia.trim() },
    };

    onSubmittingChange(true);
    onError(null);
    try {
      const res = await fetch(product ? `/api/products/${encodeURIComponent(product.code)}` : "/api/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        onError(data.error ?? "Gagal menyimpan produk.");
        return;
      }
      onSaved(product ? `${name} diperbarui.` : `${name} ditambahkan.`);
    } catch {
      onError("Koneksi gagal. Coba lagi.");
    } finally {
      onSubmittingChange(false);
    }
  }

  return (
    <form
      id={PRODUCT_FORM_ID}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      noValidate
    >
      <Section title="Foto">
        <div className="flex items-start gap-4">
          <div className="relative aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-sm border border-kat-line bg-kat-raised">
            {image ? (
              <Image src={image} alt="Foto produk" fill sizes="160px" className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-kat-muted">
                <ImagePlus className="size-6" aria-hidden />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-sm border border-kat-line px-3 text-sm text-kat-text transition-colors duration-150 hover:border-kat-muted has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fokus">
              <ImagePlus className="size-4" aria-hidden />
              {photoBusy ? "Memproses…" : image ? "Ganti foto" : "Unggah foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  void onPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="text-[11px] leading-relaxed text-kat-muted">
              JPG/PNG/WebP. Diperkecil otomatis ke maks. {MAX_SIDE}px. Foto lain di galeri tidak berubah.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Identitas">
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="Kode" hint={product ? "Tidak bisa diubah: tercetak di QR." : "Contoh: A-SD004"}>
            <input
              className={`${input} font-mono uppercase`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={Boolean(product)}
              required
              maxLength={20}
              placeholder="A-SD004"
            />
          </Field>
          <Field label="Nama produk">
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori">
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
              {(Object.keys(categoryLabel) as ProductCategory[]).map((c) => (
                <option key={c} value={c}>
                  {categoryLabel[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Harga (Rp)">
            <input
              className={`${input} font-mono tabular-nums`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="250000"
              required
            />
          </Field>
        </div>
      </Section>

      <Section title="Spesifikasi">
        <p className="-mt-2 text-[11px] text-kat-muted">
          Hanya isi nilai yang pasti. Label “Bahan Bodi”, “Daya”, dan “Kontrol Panas” dipakai oleh filter katalog.
        </p>
        <datalist id="spec-labels">
          {SPEC_LABELS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        <ul className="space-y-2">
          {specs.map((s, i) => (
            <li key={s.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
              <input
                className={input}
                list="spec-labels"
                value={s.label}
                onChange={(e) => patchSpec(s.id, { label: e.target.value })}
                placeholder="Label"
                aria-label={`Label spesifikasi ${i + 1}`}
                maxLength={60}
              />
              <input
                className={input}
                value={s.value}
                onChange={(e) => patchSpec(s.id, { value: e.target.value })}
                placeholder="Nilai, mis. 150 W"
                aria-label={`Nilai spesifikasi ${i + 1}`}
                maxLength={200}
              />
              <button
                type="button"
                onClick={() => setSpecs((rows) => rows.filter((r) => r.id !== s.id))}
                className="grid size-10 place-items-center rounded-sm text-kat-muted transition-colors duration-150 hover:bg-kat-raised hover:text-kat-text"
                aria-label={`Hapus baris spesifikasi ${i + 1}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSpecs((rows) => [...rows, { id: nextId.current++, label: "", value: "" }])}
          className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-dashed border-kat-line px-3 text-sm text-kat-muted transition-colors duration-150 hover:border-kat-muted hover:text-kat-text"
        >
          <Plus className="size-4" aria-hidden />
          Tambah baris
        </button>
      </Section>

      <Section title="Sertifikasi & catatan">
        <Field label="Catatan singkat" hint="Contoh: Portabel, Kompor cap">
          <input className={input} value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-kat-text">
          <input type="checkbox" checked={sni} onChange={(e) => setSni(e.target.checked)} className="size-4 accent-[var(--color-aksen-deep)]" />
          Bersertifikat SNI
        </label>
      </Section>

      <Section title="Link marketplace">
        <Field label="Shopee" hint="Kosongkan bila belum ada toko resmi.">
          <input className={input} type="url" value={shopee} onChange={(e) => setShopee(e.target.value)} placeholder="https://shopee.co.id/…" />
        </Field>
        <Field label="Tokopedia">
          <input
            className={input}
            type="url"
            value={tokopedia}
            onChange={(e) => setTokopedia(e.target.value)}
            placeholder="https://www.tokopedia.com/…"
          />
        </Field>
      </Section>

      {product && (
        <Section title="QR code">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected API image */}
            <img src={`/api/qr/${product.code}`} alt={`QR ${product.code}`} className="size-28 rounded-sm border border-kat-line bg-white p-1" />
            <div className="min-w-0 space-y-2">
              <p className="break-all font-mono text-[11px] text-kat-muted">
                {siteUrl}/p/{product.code}?src=qr
              </p>
              <a
                href={`/api/qr/${product.code}?download=1`}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-kat-line px-3 text-sm text-kat-text transition-colors duration-150 hover:border-kat-muted"
              >
                <Download className="size-4" aria-hidden />
                Unduh PNG
              </a>
            </div>
          </div>
        </Section>
      )}
    </form>
  );
}

export function DeleteProduct({
  code,
  name,
  onDeleted,
  onError,
}: {
  code: string;
  name: string;
  onDeleted: (message: string) => void;
  onError: (message: string | null) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    onError(null);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(code)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        onError(data.error ?? "Gagal menghapus produk.");
        return;
      }
      onDeleted(`${name} dihapus.`);
    } catch {
      onError("Koneksi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-sm px-3 text-sm text-red-700 transition-colors duration-150 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
      >
        <Trash2 className="size-4" aria-hidden />
        Hapus
      </button>
    );
  }
  return (
    <div className="w-full rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      <p>
        Hapus <strong>{code}</strong>? QR yang sudah tercetak untuk kode ini tidak akan bisa dibuka lagi. Tindakan ini tidak bisa
        dibatalkan.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => void remove()}
          disabled={busy}
          className="h-9 rounded-sm bg-red-700 px-3 font-semibold text-white transition-colors duration-150 hover:bg-red-800 disabled:opacity-60"
        >
          {busy ? "Menghapus…" : "Ya, hapus"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="h-9 rounded-sm px-3 hover:underline">
          Batal
        </button>
      </div>
    </div>
  );
}
