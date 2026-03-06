import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { markTrackUploaded } from "@/lib/vinyl";

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const { trackId, recordId } = (await request.json()) as {
    trackId: string;
    recordId: string;
  };

  if (!trackId || !recordId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await markTrackUploaded(trackId, recordId);

  return NextResponse.json({ status: "ok" });
}
