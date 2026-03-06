import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createRecord, createTracks } from "@/lib/vinyl";
import type { VinylRecord, VinylTrack } from "@/types";

interface ManualTrackInput {
  title: string;
  trackNumber: number;
  discNumber: number;
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { title, artist, year, tracks: trackInputs } = body as {
    title: string;
    artist: string;
    year: number | null;
    tracks: ManualTrackInput[];
  };

  if (!title || !artist || !trackInputs?.length) {
    return NextResponse.json(
      { error: "Title, artist, and at least one track are required" },
      { status: 400 }
    );
  }

  try {
    const recordId = crypto.randomUUID();

    const tracks: VinylTrack[] = trackInputs.map((t) => ({
      id: crypto.randomUUID(),
      recordId,
      title: t.title,
      trackNumber: t.trackNumber,
      discNumber: t.discNumber,
      duration: null,
      mbid: null,
    }));

    const record: VinylRecord = {
      id: recordId,
      title,
      artist,
      year,
      mbid: "",
      coverKey: null,
      coverUrl: null,
      trackCount: tracks.length,
      createdAt: new Date().toISOString(),
    };

    await createRecord(record);
    await createTracks(tracks);

    return NextResponse.json({ record, tracksCreated: tracks.length });
  } catch (err) {
    console.error("Manual record creation error:", err);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
