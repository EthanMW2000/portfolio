import { NextRequest, NextResponse } from "next/server";
import { getAllRecords, getRecordWithTracks } from "@/lib/vinyl";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.VINYL_IDENTIFY_API_KEY) {
    return NextResponse.json(null, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, artist } = body as { title: string; artist: string };

    if (!title || !artist) {
      return NextResponse.json(
        { error: "Missing title or artist" },
        { status: 400 }
      );
    }

    const records = await getAllRecords();
    const queryArtist = normalize(artist);
    const queryTitle = normalize(title);

    const matchedRecord = records.find((r) => {
      if (!normalize(r.artist).includes(queryArtist) && !queryArtist.includes(normalize(r.artist))) {
        return false;
      }
      return true;
    });

    if (!matchedRecord) {
      return NextResponse.json({ match: null });
    }

    const full = await getRecordWithTracks(matchedRecord.id);
    if (!full) {
      return NextResponse.json({ match: null });
    }

    const matchedTrack = full.tracks.find((t) =>
      normalize(t.title).includes(queryTitle) || queryTitle.includes(normalize(t.title))
    );

    return NextResponse.json({
      match: {
        track: matchedTrack
          ? { id: matchedTrack.id, title: matchedTrack.title, trackNumber: matchedTrack.trackNumber }
          : null,
        record: {
          id: full.id,
          title: full.title,
          artist: full.artist,
          coverUrl: full.coverUrl,
        },
      },
    });
  } catch (err) {
    console.error("Identify error:", err);
    return NextResponse.json(
      { error: "Identification failed" },
      { status: 500 }
    );
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
