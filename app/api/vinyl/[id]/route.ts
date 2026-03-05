import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getRecordWithTracks, deleteRecordAndTracks } from "@/lib/vinyl";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const record = await getRecordWithTracks(id);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err) {
    console.error("Vinyl detail error:", err);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const { id } = await params;

  try {
    await deleteRecordAndTracks(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("Vinyl delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
