import { NextResponse, type NextRequest } from "next/server";
import { jwtDecrypt } from "jose";

const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = `__Secure-${SESSION_COOKIE}`;

async function deriveKey(secret: string, salt: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "HKDF",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: enc.encode(salt),
      info: enc.encode(`Auth.js Generated Encryption Key (${salt})`),
    },
    base,
    512,
  );
  return new Uint8Array(bits);
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const name = req.cookies.has(SECURE_SESSION_COOKIE)
    ? SECURE_SESSION_COOKIE
    : SESSION_COOKIE;
  const token = req.cookies.get(name)?.value;
  if (!token || !process.env.AUTH_SECRET) return false;
  try {
    const key = await deriveKey(process.env.AUTH_SECRET, name);
    await jwtDecrypt(token, key, { clockTolerance: 15 });
    return true;
  } catch {
    return false;
  }
}

function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(SECURE_SESSION_COOKIE);
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie =
    req.cookies.has(SESSION_COOKIE) || req.cookies.has(SECURE_SESSION_COOKIE);
  const session = await hasValidSession(req);

  if (pathname.startsWith("/panel") && !session) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    return hasCookie ? clearSessionCookie(res) : res;
  }
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/panel", req.url));
  }
  const res = NextResponse.next();
  return hasCookie && !session ? clearSessionCookie(res) : res;
}

export const config = {
  matcher: ["/panel/:path*", "/login"],
};
