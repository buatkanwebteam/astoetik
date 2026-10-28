import { z } from "zod";

export const advisorSchema = z.object({
  summary: z.string().describe("Ringkasan performa 2-3 kalimat berbasis angka"),
  recommendations: z
    .array(
      z.object({
        priority: z.number().int().min(1).max(5).describe("1 = paling penting"),
        title: z.string(),
        platform: z.string().describe("TikTok, Instagram, Shopee, YouTube, atau Semua"),
        reason: z.string().describe("Alasan yang menyebut angka dari data"),
        action: z.string().describe("Aksi konkret yang bisa dikerjakan minggu ini"),
      }),
    )
    .min(3)
    .max(5),
});
export type AdvisorResult = z.infer<typeof advisorSchema>;

export const contentIdeasSchema = z.object({
  ideas: z
    .array(
      z.object({
        platform: z.enum(["instagram", "tiktok"]),
        title: z.string(),
        caption: z.string(),
        format: z.enum(["reel", "carousel", "video", "live", "story"]),
        dayOfMonth: z.number().int().min(1).max(28),
        hour: z.number().int().min(6).max(22),
        productCode: z.string().nullable(),
      }),
    )
    .min(1)
    .max(10),
});
export type ContentIdeas = z.infer<typeof contentIdeasSchema>;

export const insightsSchema = z.object({
  topics: z
    .array(
      z.object({
        topic: z.string(),
        messageIndexes: z.array(z.number().int().min(0)).describe("Indeks pertanyaan (dari daftar) yang masuk topik ini"),
        examples: z.array(z.string()).max(3),
        action: z.string(),
      }),
    )
    .max(8),
});
export type InsightsResult = z.infer<typeof insightsSchema>;
