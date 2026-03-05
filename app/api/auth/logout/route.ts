import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_URL}/`,
    { status: 303 }
  );
  clearAuthCookie(response);
  return response;
}
