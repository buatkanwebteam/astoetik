"use client";

import { useActionState, useState } from "react";
import { FaArrowRightToBracket, FaSpinner } from "react-icons/fa6";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  // Controlled so a failed attempt (React resets uncontrolled fields) does not wipe the username.
  const [username, setUsername] = useState("");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
          Username
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="block w-full rounded-xl border border-tanah-200 bg-krem px-3 py-2.5 text-sm text-ink focus:outline-none"
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
          className="block w-full rounded-xl border border-tanah-200 bg-krem px-3 py-2.5 text-sm text-ink focus:outline-none"
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
        {pending ? <FaSpinner className="size-4 animate-spin" aria-hidden /> : <FaArrowRightToBracket className="size-4" aria-hidden />}
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
