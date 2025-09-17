// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = new Set([
  "/", "/login", "/health"
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // add any other public pages here
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // --- ALWAYS allow framework internals & static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.match(/\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // --- ALWAYS allow ALL API routes (not just /api/auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const hasSession =
    !!req.cookies.get("__Secure-next-auth.session-token") ||
    !!req.cookies.get("next-auth.session-token");

  // If logged in and visiting /login, send to app home
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // If not logged in and path is protected => send to /login with relative callback
  if (!hasSession && !isPublicPath(pathname)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude _next, ALL api, and static files from the matcher entirely
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
