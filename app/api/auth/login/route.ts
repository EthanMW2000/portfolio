import { NextRequest, NextResponse } from "next/server";
import { getSession, adminPath } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const next = adminPath(request.nextUrl.searchParams.get("next"));
  if (next && (await getSession(request))) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}${next}`);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user",
    state,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  if (next) {
    response.cookies.set("oauth_next", next, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  return response;
}
