import { NextRequest, NextResponse } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getAllFingerprints, getRecord } from "@/lib/vinyl";
import { decodeChromaprint, compareFingerprints } from "@/lib/fingerprint";
import { buildDynamoClient } from "@/lib/aws";

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

    if (candidates.length === 0) {
      return NextResponse.json({ match: null });
    }

    const result = compareFingerprints(query, candidates);

    if (!result) {
      return NextResponse.json({ match: null });
    }

    const [record, track] = await Promise.all([
      getRecord(result.recordId),
      getTrack(result.trackId),
    ]);

    return NextResponse.json({
      match: {
        similarity: result.similarity,
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

async function getTrack(trackId: string) {
  const db = buildDynamoClient();
  const result = await db.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_VINYL_TRACKS_TABLE!,
      Key: { id: trackId },
    })
  );
  return result.Item ?? null;
}
