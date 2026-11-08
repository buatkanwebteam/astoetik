"use client";

import { FaPaperPlane } from "react-icons/fa6";
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
    <section
      aria-labelledby="chat-title"
      className="flex flex-col rounded-3xl bg-gradient-to-br from-hm-dark via-hm-deep to-hm-deep p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.3)] ring-1 ring-white/20 sm:p-6"
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <h2 id="chat-title" className="font-display text-lg font-semibold text-white">
          Tanya Asisten
        </h2>
      </header>

      <div ref={listRef} className="mt-4 max-h-96 min-h-48 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-hm-gold font-medium text-hm-deep" : "border border-white/20 bg-white/10 text-white"
              }`}
            >
              {m.content || <span className="inline-block animate-pulse text-white/60">Mengetik…</span>}
            </p>
          </div>
        ))}
      </div>

      {messages.length <= 1 && suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-full bg-hm-gold px-4 py-2 text-left text-xs font-semibold text-hm-deep transition hover:bg-white disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      )}

      <form
        className="mt-4 flex items-center gap-2 rounded-full bg-white/10 py-2 pl-5 pr-2 ring-1 ring-white/20"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
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
          placeholder="Tulis pertanyaan"
          className="block min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Kirim pertanyaan"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-hm-gold text-hm-deep transition hover:bg-white disabled:opacity-40"
        >
          <FaPaperPlane className="size-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}
