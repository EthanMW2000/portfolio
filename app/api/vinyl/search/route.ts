import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { searchReleases, searchArtistReleases } from "@/lib/musicbrainz";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const query = request.nextUrl.searchParams.get("q") || undefined;
  const artist = request.nextUrl.searchParams.get("artist") || undefined;

  if (!query && !artist) {
    return NextResponse.json({ error: "Missing query or artist" }, { status: 400 });
  }

  try {
    const releases = artist && !query
      ? await searchArtistReleases(artist)
      : await searchReleases(query!, artist);
    return NextResponse.json({ releases });
  } catch (err) {
    console.error("MusicBrainz search error:", err);
    return NextResponse.json(
      { error: "Failed to search MusicBrainz" },
      { status: 500 }
    );
  }
}
