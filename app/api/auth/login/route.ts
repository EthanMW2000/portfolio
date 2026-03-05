import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  return response;
}
