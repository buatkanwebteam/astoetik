import "server-only";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "@/lib/env";

export class AiError extends Error {}

/** After a permission or quota refusal we stop calling Gemini for a while and answer locally. */
let blockedUntil = 0;
const BLOCK_MS = 5 * 60 * 1000;

function statusOf(err: unknown): number | undefined {
  const s = (err as { status?: unknown })?.status;
  return typeof s === "number" ? s : undefined;
}

function noteFailure(err: unknown) {
  const status = statusOf(err);
  if (status === 401 || status === 403) blockedUntil = Date.now() + BLOCK_MS;
  console.error("[gemini] request failed", status ?? "", err instanceof Error ? err.message.slice(0, 200) : "");
}

/** Chat prefers the fast model; analysis prefers the quality model. Each falls back to the other. */
function models(kind: "chat" | "json"): string[] {
  const order = kind === "chat" ? [env.geminiFastModel, env.geminiModel] : [env.geminiModel, env.geminiFastModel];
  return order.filter((m, i, all) => m && all.indexOf(m) === i);
}

function assertAvailable() {
  if (Date.now() < blockedUntil) throw new AiError("Gemini tidak tersedia untuk sementara.");
}

/**
 * Wraps a Gemini stream: if it fails before sending anything, answer from the local fallback instead
 * (FAQ search), so the chatbot keeps working when the key, quota or network is a problem.
 */
export async function* withFallback(primary: AsyncGenerator<string>, fallback: () => AsyncGenerator<string>): AsyncGenerator<string> {
  let started = false;
  try {
    for await (const chunk of primary) {
      started = true;
      yield chunk;
    }
  } catch (err) {
    if (started) throw err;
    yield* fallback();
  }
}

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
  assertAvailable();
  const contents = [
    ...opts.history.map((h) => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.content }] })),
    { role: "user", parts: [{ text: opts.message }] },
  ];
  const list = models("chat");
  for (let i = 0; i < list.length; i++) {
    let started = false;
    try {
      const stream = await client().models.generateContentStream({
        model: list[i],
        contents,
        config: { systemInstruction: opts.system, temperature: 0.3, maxOutputTokens: 1024 },
      });
      for await (const chunk of stream) {
        if (chunk.text) {
          started = true;
          yield chunk.text;
        }
      }
      return;
    } catch (err) {
      noteFailure(err);
      // Mid-answer failures cannot be retried on another model without repeating text.
      if (started || i === list.length - 1 || Date.now() < blockedUntil) throw err;
    }
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
  assertAvailable();
  let lastError: unknown;
  for (const model of models("json")) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await client().models.generateContent({
          model,
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
        // An API error (quota, permission, outage) goes straight to the next model; bad JSON retries once.
        if (statusOf(err) !== undefined) {
          noteFailure(err);
          break;
        }
      }
    }
    if (Date.now() < blockedUntil) break;
  }
  console.error("[gemini] structured generation failed", lastError instanceof Error ? lastError.message.slice(0, 200) : "");
  throw new AiError("AI gagal menghasilkan jawaban yang valid. Coba lagi sebentar lagi.");
}
