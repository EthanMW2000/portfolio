import { NextRequest, NextResponse } from "next/server";
import { getRecord, findTrackByMbid } from "@/lib/vinyl";
import { lookupByFingerprint } from "@/lib/acoustid";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.VINYL_IDENTIFY_API_KEY) {
    return NextResponse.json(null, { status: 404 });
  }

  try {
    const body = await request.json();
    const { fingerprint, duration } = body as {
      fingerprint: string;
      duration: number;
    };

    if (!fingerprint || !duration) {
      return NextResponse.json(
        { error: "Missing fingerprint or duration" },
        { status: 400 }
      );
    }

    const acoustIdMatches = await lookupByFingerprint(fingerprint, duration);

    for (const match of acoustIdMatches) {
      const track = await findTrackByMbid(match.recordingMbid);
      if (!track) continue;

      const record = await getRecord(track.recordId);

      return NextResponse.json({
        match: {
          similarity: match.score,
          track: { id: track.id, title: track.title, trackNumber: track.trackNumber },
          record: record
            ? {
                id: record.id,
                title: record.title,
                artist: record.artist,
                coverUrl: record.coverUrl,
              }
            : null,
        },
      });
    }

    return NextResponse.json({ match: null });
  } catch (err) {
    console.error("Identify error:", err);
    return NextResponse.json(
      { error: "Identification failed" },
      { status: 500 }
    );
  }
}
