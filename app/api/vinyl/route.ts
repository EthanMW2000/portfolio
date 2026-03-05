import { NextResponse } from "next/server";
import { getAllRecords, getCollectionStats } from "@/lib/vinyl";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [records, stats] = await Promise.all([
      getAllRecords(),
      getCollectionStats(),
    ]);
    return NextResponse.json({ records, stats });
  } catch (err) {
    console.error("Vinyl API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vinyl collection" },
      { status: 500 }
    );
  }
}
