"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

export function LoginForm({ next, demoHint }: { next: string; demoHint: { email: string; password: string } | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={demoHint?.email}
          className="block w-full rounded-xl border border-tanah-200 bg-krem px-3 py-2.5 text-sm text-ink focus:border-emas focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="block w-full rounded-xl border border-tanah-200 bg-krem px-3 py-2.5 text-sm text-ink focus:border-emas focus:outline-none"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-tanah-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-tanah-700 disabled:opacity-60"
      >
        <LogIn className="size-4" aria-hidden />
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
      {demoHint && (
        <p className="rounded-lg bg-emas-soft/60 px-3 py-2 text-xs text-tanah-800">
          <strong>Mode Demo.</strong> Gunakan <code>{demoHint.email}</code> / <code>{demoHint.password}</code>
        </p>
      )}
    </form>
  );
}
