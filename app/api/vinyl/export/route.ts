import { NextRequest, NextResponse } from "next/server";
import { getAllRecords, getAllTracks } from "@/lib/vinyl";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.VINYL_IDENTIFY_API_KEY) {
    return NextResponse.json(null, { status: 404 });
  }

  try {
    const [records, tracks] = await Promise.all([
      getAllRecords(),
      getAllTracks(),
    ]);

    const tracksMap: Record<
      string,
      { title: string; trackNumber: number; recordId: string }
    > = {};
    for (const t of tracks) {
      tracksMap[t.id] = {
        title: t.title,
        trackNumber: t.trackNumber,
        recordId: t.recordId,
      };
    }

    const recordsMap: Record<
      string,
      { title: string; artist: string; coverUrl: string | null }
    > = {};
    for (const r of records) {
      recordsMap[r.id] = {
        title: r.title,
        artist: r.artist,
        coverUrl: r.coverUrl,
      };
    }

    return NextResponse.json({ tracks: tracksMap, records: recordsMap });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
