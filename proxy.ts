import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "authjs.session-token";

function hasSession(req: NextRequest): boolean {
  return (
    req.cookies.has(SESSION_COOKIE) ||
    req.cookies.has(`__Secure-${SESSION_COOKIE}`)
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = hasSession(req);

  if (pathname.startsWith("/panel") && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/panel", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/login"],
};
