import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getReleaseDetails, findCoverArt } from "@/lib/musicbrainz";

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const params = request.nextUrl.searchParams;
  const releaseId = params.get("id");
  if (!releaseId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { tracks, releaseGroupId } = await getReleaseDetails(releaseId);
    const coverArt = await findCoverArt(
      releaseId,
      releaseGroupId,
      params.get("artist") ?? "",
      params.get("title") ?? ""
    );

    return NextResponse.json({
      tracks,
      coverArtUrl: coverArt?.url ?? null,
      coverSource: coverArt?.source ?? null,
    });
  } catch (err) {
    console.error("Preview error:", err);
    return NextResponse.json(
      { error: "Failed to fetch release details" },
      { status: 500 }
    );
  }
}
