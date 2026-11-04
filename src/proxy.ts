import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";

// Optimistic auth gate. Route handlers and the dashboard layout re-check the
// session server-side as defense in depth.
export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/ai/:path*",
    "/api/export/:path*",
    "/api/content-plans/:path*",
    "/api/qr/:path*",
    "/api/products/:path*",
  ],
};
