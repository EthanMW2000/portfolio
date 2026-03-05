import { NextRequest, NextResponse } from "next/server";
import { parseExif } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const exif = await parseExif(url);
    return NextResponse.json(exif);
  } catch {
    return NextResponse.json({ error: "Failed to parse EXIF" }, { status: 500 });
  }
}
