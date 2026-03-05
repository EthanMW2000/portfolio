import { NextRequest, NextResponse } from "next/server";
import {
  getAllFingerprints,
  getRecord,
  getTrack,
  findTrackByMbid,
  updateTrackFingerprint,
} from "@/lib/vinyl";
import { decodeChromaprint, compareFingerprints } from "@/lib/fingerprint";
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

    if (!fingerprint) {
      return NextResponse.json(
        { error: "Missing fingerprint" },
        { status: 400 }
      );
    }

    const query = decodeChromaprint(fingerprint);

    const candidates = await getAllFingerprints();
    if (candidates.length > 0) {
      const localMatch = compareFingerprints(query, candidates);
      if (localMatch) {
        const [record, track] = await Promise.all([
          getRecord(localMatch.recordId),
          getTrack(localMatch.trackId),
        ]);
        return NextResponse.json({
          match: buildMatchResponse(record, track, localMatch.similarity),
          source: "local",
        });
      }
    }

    const acoustIdMatches = await lookupByFingerprint(fingerprint, duration);

    for (const aMatch of acoustIdMatches) {
      const track = await findTrackByMbid(aMatch.recordingMbid);
      if (!track) continue;

      const record = await getRecord(track.recordId);

      updateTrackFingerprint(track.id, query).catch((err) =>
        console.error(`Failed to save fingerprint for ${track.title}:`, err)
      );

      return NextResponse.json({
        match: buildMatchResponse(record, track, aMatch.score),
        source: "acoustid",
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

function buildMatchResponse(
  record: { id: string; title: string; artist: string; coverUrl: string | null } | null,
  track: { id: string; title: string; trackNumber: number } | null,
  similarity: number
) {
  return {
    similarity,
    track: track
      ? { id: track.id, title: track.title, trackNumber: track.trackNumber }
      : null,
    record: record
      ? {
          id: record.id,
          title: record.title,
          artist: record.artist,
          coverUrl: record.coverUrl,
        }
      : null,
  };
}
