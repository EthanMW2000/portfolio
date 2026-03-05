import { NextRequest, NextResponse } from "next/server";
import { signSession, setAuthCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
    }),
  });

  const { access_token } = await tokenRes.json();
  if (!access_token) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const user = await userRes.json();

  if (String(user.id) !== String(process.env.GITHUB_ALLOWED_USER_ID!)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await signSession({ sub: String(user.id) });
  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/admin`);
  setAuthCookie(response, token);

  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });

  return response;
}
