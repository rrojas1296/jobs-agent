import { NextRequest, NextResponse } from "next/server";
import { routeDestination } from "@/lib/auth/route-policy";
import type { User } from "@/features/auth/types/user";
export async function proxy(request: NextRequest) {
  const base = process.env.API_URL ?? "http://localhost:4000";
  let cookie = request.headers.get("cookie") ?? "";
  const updatedCookies: string[] = [];
  let user: User | null = null;
  try {
    let response = await fetch(`${base}/auth/me`, {
      headers: { cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 401 && request.cookies.has("refresh_token")) {
      const refresh = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { cookie, origin: request.nextUrl.origin, "x-requested-with": "jobs-web" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!refresh.ok && refresh.status !== 401) throw new Error("Session renewal unavailable");
      if (refresh.ok) {
        updatedCookies.push(...refresh.headers.getSetCookie());
        const pairs = new Map(
          cookie.split("; ").map((item) => {
            const index = item.indexOf("=");
            return [item.slice(0, index), item.slice(index + 1)];
          }),
        );
        for (const item of updatedCookies) {
          const pair = item.split(";")[0] ?? "";
          const index = pair.indexOf("=");
          pairs.set(pair.slice(0, index), pair.slice(index + 1));
        }
        cookie = [...pairs].map(([key, value]) => `${key}=${value}`).join("; ");
        response = await fetch(`${base}/auth/me`, {
          headers: { cookie },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
      }
    }
    if (response.ok) user = (await response.json()) as User;
    else if (response.status !== 401) throw new Error("Authentication service unavailable");
  } catch {
    return new NextResponse(
      "El servicio no está disponible. Vuelve a intentarlo en unos momentos.",
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "10" },
      },
    );
  }
  const destination = routeDestination(request.nextUrl.pathname, user);
  const headers = new Headers(request.headers);
  headers.set("cookie", cookie);
  const result = destination
    ? NextResponse.redirect(new URL(destination, request.url))
    : NextResponse.next({ request: { headers } });
  for (const value of updatedCookies) result.headers.append("set-cookie", value);
  result.headers.set("Cache-Control", "private, no-store");
  return result;
}
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/onboarding",
    "/dashboard/:path*",
    "/jobs/:path*",
    "/applications/:path*",
    "/resumes/:path*",
    "/saved/:path*",
    "/settings/:path*",
  ],
};
