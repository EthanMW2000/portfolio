import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getUploadPresignedUrl } from "@/lib/s3";
import { cdnUrl } from "@/lib/aws";

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { recordId, contentType } = body as {
    recordId: string;
    contentType: string;
  };

  if (!recordId || !contentType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9-]+$/.test(recordId)) {
    return NextResponse.json({ error: "Invalid recordId" }, { status: 400 });
  }

  const key = `vinyl/covers/${recordId}.jpg`;
  const uploadUrl = await getUploadPresignedUrl(key);
  const coverUrl = cdnUrl(key);

  return NextResponse.json({ uploadUrl, key, coverUrl });
}
