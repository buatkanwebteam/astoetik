import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "@/lib/env";

export class AiError extends Error {}

let ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  ai ??= new GoogleGenAI({ apiKey: env.geminiKey });
  return ai;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function* streamChat(opts: { system: string; history: ChatTurn[]; message: string }): AsyncGenerator<string> {
  const contents = [
    ...opts.history.map((h) => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] })),
    { role: "user", parts: [{ text: opts.message }] },
  ];
  const stream = await client().models.generateContentStream({
    model: env.geminiModel,
    contents,
    config: { systemInstruction: opts.system, temperature: 0.3 },
  });
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

function toResponseSchema(schema: z.ZodType): unknown {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/**
 * Structured generation: JSON mode + schema, validated with zod.
 * Retries once on invalid output, then throws AiError.
 */
export async function generateJson<T>(schema: z.ZodType<T>, opts: { system: string; prompt: string }): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client().models.generateContent({
        model: env.geminiModel,
        contents: opts.prompt,
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: toResponseSchema(schema),
          temperature: 0.4,
        },
      });
      return schema.parse(JSON.parse(res.text ?? ""));
    } catch (err) {
      lastError = err;
    }
  }
  console.error("[gemini] structured generation failed", lastError);
  throw new AiError("AI gagal menghasilkan jawaban yang valid. Coba lagi sebentar lagi.");
}
