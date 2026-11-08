import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Login Admin" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === "string" ? next : "/dashboard";
  if (await getSession()) redirect(nextPath.startsWith("/dashboard") ? nextPath : "/dashboard");

  return (
    <main className="batik-pattern flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl ring-1 ring-black/5">
        <h1 className="font-display text-3xl text-tanah-700">Masuk Dashboard</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">Khusus admin CV. Astoetik Indonesia.</p>
        <LoginForm next={nextPath} />
      </div>
    </main>
  );
}
