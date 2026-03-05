import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const notFound = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/_not-found";
    return NextResponse.rewrite(url, { status: 404 });
  };

  if (!token) return notFound();

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return notFound();
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
