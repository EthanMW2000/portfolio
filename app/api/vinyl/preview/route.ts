import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getReleaseTracks, getCoverArtUrl } from "@/lib/musicbrainz";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const releaseId = request.nextUrl.searchParams.get("id");
  if (!releaseId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const [tracks, coverArtUrl] = await Promise.all([
      getReleaseTracks(releaseId),
      getCoverArtUrl(releaseId),
    ]);

    return NextResponse.json({ tracks, coverArtUrl });
  } catch (err) {
    console.error("Preview error:", err);
    return NextResponse.json(
      { error: "Failed to fetch release details" },
      { status: 500 }
    );
  }
}
