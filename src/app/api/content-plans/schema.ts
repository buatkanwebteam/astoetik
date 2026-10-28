import { z } from "zod";

// No defaults here: defaults would survive .partial() and overwrite fields on PATCH.
const base = z.object({
  platform: z.enum(["instagram", "tiktok"]),
  title: z.string().trim().min(1, "Judul wajib diisi.").max(160),
  caption: z.string().max(2000),
  format: z.string().trim().min(1).max(40),
  scheduledAt: z.iso.datetime({ message: "Tanggal tidak valid." }),
  status: z.enum(["idea", "draft", "scheduled", "posted"]),
  productCode: z.string().max(20).nullable(),
});

export const planInputSchema = base.extend({
  caption: base.shape.caption.default(""),
  productCode: base.shape.productCode.default(null),
});

export const planPatchSchema = base.partial();
