import { NextRequest, NextResponse } from "next/server";
import { getAlbums, getAlbumPhotos, getAllPhotos } from "@/lib/photography";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("mode") ?? "albums";
  const albumParam = searchParams.get("album");

  try {
    if (mode === "albums") {
      return NextResponse.json({ albums: await getAlbums() });
    }
    if (mode === "album" && albumParam) {
      return NextResponse.json({ photos: await getAlbumPhotos(albumParam), album: albumParam });
    }
    if (mode === "flat") {
      return NextResponse.json({ photos: await getAllPhotos() });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("Photography API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch photography data" },
      { status: 500 }
    );
  }
}
