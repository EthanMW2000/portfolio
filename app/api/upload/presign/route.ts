import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getUploadPresignedUrl } from "@/lib/s3";

function sanitizeAlbum(album: string): string {
  return album
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/\.\.+/g, "");
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { album, filename, contentType } = body as {
    album: string;
    filename: string;
    contentType: string;
  };

  if (!album || !filename || !contentType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const safeAlbum = sanitizeAlbum(album);
  if (!safeAlbum) {
    return NextResponse.json({ error: "Invalid album name" }, { status: 400 });
  }

  const key = `originals/${safeAlbum}/${filename}`;
  const uploadUrl = await getUploadPresignedUrl(key);

  return NextResponse.json({ uploadUrl, key });
}
