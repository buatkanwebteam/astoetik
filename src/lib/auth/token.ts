// Signed session token (HMAC-SHA256 via Web Crypto). No Node-only APIs, so it
// runs in both proxy.ts and server code.

export const SESSION_COOKIE = "astera_session";
export const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

const DEV_FALLBACK_SECRET = "astera-demo-secret-change-me";

export interface SessionPayload {
  email: string;
  exp: number; // unix seconds
}

function secret(): string {
  return process.env.SESSION_SECRET || DEV_FALLBACK_SECRET;
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(email: string): Promise<string> {
  const payload: SessionPayload = { email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (typeof payload.email !== "string" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
