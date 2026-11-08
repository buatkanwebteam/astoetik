import { z } from "zod";
import type { ProductUnit } from "@/types";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), { message: "Tanggal tidak valid." });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((s) => s || null);

export const unitFieldsSchema = z.object({
  productionCode: z.string().trim().min(1, "Kode produksi wajib diisi.").max(60),
  productionDate: isoDate,
  warrantyMonths: z.number().int("Garansi harus bilangan bulat.").min(0).max(120, "Garansi maksimal 120 bulan."),
  qcDate: isoDate.nullable(),
  qcInspector: optionalText(80),
  note: optionalText(300),
});

export const unitCreateSchema = unitFieldsSchema.extend({
  serial: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{1,20}$/, "Nomor seri hanya huruf, angka, dan tanda hubung (maks. 20 karakter)."),
});

export type UnitFields = z.infer<typeof unitFieldsSchema>;

export function toUnit(productCode: string, serial: string, f: UnitFields, createdAt: string): ProductUnit {
  return { productCode, serial, ...f, qcStatus: "lulus", createdAt };
}
