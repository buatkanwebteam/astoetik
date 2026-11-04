import { z } from "zod";
import type { Product } from "@/types";

// Uploaded photos arrive as data URLs already downscaled in the browser
// (max 1200px JPEG, see ProductForm). ~2 MB of base64 is a generous ceiling.
const MAX_IMAGE_CHARS = 2_000_000;

const image = z
  .string()
  .max(MAX_IMAGE_CHARS, "Foto terlalu besar.")
  .refine((s) => /^\/products\/[\w.-]+$/.test(s) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s), {
    message: "Format foto tidak didukung.",
  });

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((s) => s === "" || /^https:\/\//.test(s), { message: "Link marketplace harus diawali https://" });

export const productFieldsSchema = z.object({
  name: z.string().trim().min(1, "Nama produk wajib diisi.").max(120),
  category: z.enum(["kompor", "kompor-cap", "canting"]),
  price: z.number().int("Harga harus bilangan bulat.").min(0, "Harga tidak boleh negatif.").max(100_000_000),
  specs: z
    .array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(200) }))
    .max(30),
  sni: z.boolean(),
  note: z.string().trim().max(120).nullable(),
  image,
  marketplaceLinks: z.object({ shopee: optionalUrl, tokopedia: optionalUrl }),
});

export const productCreateSchema = productFieldsSchema.extend({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,20}$/, "Kode hanya huruf, angka, dan tanda hubung (2–20 karakter)."),
});

export type ProductFields = z.infer<typeof productFieldsSchema>;

/**
 * Empty optional fields are stored as null / omitted, never as "".
 * TKDN is not edited from the dashboard; callers pass the stored value through.
 */
export function toProduct(code: string, f: ProductFields, gallery: string[], tkdn: string | null): Product {
  const links: Product["marketplaceLinks"] = {};
  if (f.marketplaceLinks.shopee) links.shopee = f.marketplaceLinks.shopee;
  if (f.marketplaceLinks.tokopedia) links.tokopedia = f.marketplaceLinks.tokopedia;
  return {
    code,
    name: f.name,
    category: f.category,
    price: f.price,
    specs: f.specs,
    tkdn,
    sni: f.sni,
    image: f.image,
    gallery,
    marketplaceLinks: links,
    note: f.note || null,
  };
}
