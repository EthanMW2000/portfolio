import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { updateTrack } from "@/lib/vinyl";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  await params;
  const body = await request.json();
  const { tracks } = body as {
    tracks: { id: string; title?: string; trackNumber?: number }[];
  };

  if (!Array.isArray(tracks)) {
    return NextResponse.json({ error: "tracks must be an array" }, { status: 400 });
  }

  try {
    for (const track of tracks) {
      await updateTrack(track.id, {
        title: track.title,
        trackNumber: track.trackNumber,
      });
    }
    return NextResponse.json({ updated: tracks.length });
  } catch (err) {
    console.error("Track update error:", err);
    return NextResponse.json(
      { error: "Failed to update tracks" },
      { status: 500 }
    );
  }
}
