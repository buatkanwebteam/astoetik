"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";

const MAX_LEN = 500;
const SUGGESTIONS = ["Beri 5 rekomendasi prioritas", "Platform mana paling efektif?", "Format konten apa yang terbaik?"];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

/** AI Advisor chat. Same glass style as the landing page ASKA chat, but talks to /api/ai/advisor-chat. */
export function AdvisorChat({ days, className = "" }: { days: number; className?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const message = text.trim().slice(0, MAX_LEN);
    if (!message || busy) return;
    setError(null);
    setInput("");
    setBusy(true);
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, days }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Gagal menghubungi AI Advisor.");
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
      setMessages((m) => m.slice(0, -2));
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="AI Advisor"
      className={`flex min-h-[28rem] min-w-0 flex-col rounded-3xl bg-gradient-to-br from-hm-dark/90 via-hm-deep/90 to-hm-deep p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.3)] ring-1 ring-white/20 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2" aria-hidden>
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <p className="text-xs text-white/70">
          AI Advisor, data {days} hari terakhir
        </p>
      </div>

      <div ref={listRef} className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]" aria-live="polite">
        <p className="text-sm text-hm-gold/80">Hai, saya AI Advisor. Tanya apa saja soal performa konten dan penjualan periode ini ya.</p>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-hm-gold font-medium text-hm-deep" : "border border-white/20 bg-white/10 text-white"
              }`}
            >
              {m.content || <span className="inline-block animate-pulse text-white/60">Menganalisis…</span>}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      )}

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              disabled={busy}
              className="rounded-full bg-hm-gold px-4 py-2 text-xs font-semibold text-hm-deep transition hover:bg-white disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-4 flex items-center gap-2 rounded-full bg-white/10 py-2 pl-5 pr-2 ring-1 ring-white/20"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="advisor-input" className="sr-only">
          Tulis pertanyaan untuk AI Advisor
        </label>
        <input
          id="advisor-input"
          value={input}
          maxLength={MAX_LEN}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanya sesuatu"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Kirim pertanyaan"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-hm-gold text-hm-deep transition hover:bg-white disabled:opacity-40"
        >
          <FaArrowRight className="size-4" aria-hidden />
        </button>
      </form>
    </section>
  );
}
