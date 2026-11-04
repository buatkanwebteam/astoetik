"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { track } from "./track";

const MAX_LEN = 500;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function sessionIdFor(productCode: string): string {
  const key = `astera:chat:${productCode}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function ProductChat({
  productCode,
  productName,
  suggestions,
}: {
  productCode: string;
  productName: string;
  suggestions: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: `Halo! Saya asisten ${productName}. Mau tanya spesifikasi, cara pakai, atau perawatan?` },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opened = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function markOpened() {
    if (opened.current) return;
    opened.current = true;
    track(productCode, "chat_open", {});
  }

  async function send(text: string) {
    const message = text.trim().slice(0, MAX_LEN);
    if (!message || busy) return;
    markOpened();
    setError(null);
    setInput("");
    setBusy(true);
    const history = messages.slice(1).slice(-8);
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdFor(productCode), productCode, message, history }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Gagal menghubungi asisten.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
    } catch (e) {
      setMessages((m) => m.slice(0, -1));
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="chat-title" className="overflow-hidden rounded-md border border-kat-line bg-kat-card">
      <header className="border-b border-kat-line bg-kat-raised px-4 py-3">
        <h2 id="chat-title" className="font-grotesk text-lg font-semibold text-kat-text">
          Tanya Asisten
        </h2>
      </header>

      <div ref={listRef} className="max-h-96 min-h-48 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-md px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-aksen-deep text-on-aksen" : "bg-kat-raised text-kat-text"
              }`}
            >
              {m.content || <span className="inline-block animate-pulse text-kat-muted">Mengetik…</span>}
            </p>
          </div>
        ))}
      </div>

      {messages.length <= 1 && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-sm border border-kat-line px-3 py-1.5 text-left text-xs text-kat-text transition-colors duration-150 hover:border-aksen disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mx-4 mb-2 rounded-sm bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}

      <form
        className="flex items-end gap-2 border-t border-kat-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <div className="flex-1">
          <label htmlFor="chat-input" className="sr-only">
            Tulis pertanyaan tentang {productName}
          </label>
          <textarea
            id="chat-input"
            rows={1}
            value={input}
            maxLength={MAX_LEN}
            onFocus={markOpened}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder="Tulis pertanyaan…"
            className="block w-full resize-none rounded-sm border border-kat-line bg-kat-bg px-3 py-2.5 text-sm text-kat-text placeholder:text-kat-muted/70 focus:border-aksen focus:outline-none"
          />
          <p className="mt-1 text-right text-[11px] text-kat-muted">
            {input.length}/{MAX_LEN}
          </p>
        </div>
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Kirim pertanyaan"
          className="mb-5 grid size-10 place-items-center rounded-sm bg-aksen-deep text-on-aksen transition-colors duration-150 hover:bg-aksen disabled:opacity-40"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}
