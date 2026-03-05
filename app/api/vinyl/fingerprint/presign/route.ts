import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getUploadPresignedUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { trackId, contentType, extension } = body as {
    trackId: string;
    contentType: string;
    extension: string;
  };

  if (!trackId || !contentType || !extension) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9-]+$/.test(trackId)) {
    return NextResponse.json({ error: "Invalid trackId" }, { status: 400 });
  }

  const safeExt = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!safeExt) {
    return NextResponse.json({ error: "Invalid extension" }, { status: 400 });
  }

  const key = `vinyl/audio/${trackId}.${safeExt}`;
  const uploadUrl = await getUploadPresignedUrl(key);

  return NextResponse.json({ uploadUrl, key });
}
