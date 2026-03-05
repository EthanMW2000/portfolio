import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
const COOKIE = "auth_token";

export interface Session {
  sub: string;
}

export async function signSession(payload: Session): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function requireSession(
  request: NextRequest
): Promise<Session | NextResponse> {
  const session = await getSession(request);
  if (!session) return NextResponse.json(null, { status: 404 });
  return session;
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
