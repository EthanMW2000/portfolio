import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { searchReleases } from "@/lib/musicbrainz";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const releases = await searchReleases(query);
    return NextResponse.json({ releases });
  } catch (err) {
    console.error("MusicBrainz search error:", err);
    return NextResponse.json(
      { error: "Failed to search MusicBrainz" },
      { status: 500 }
    );
  }
}
