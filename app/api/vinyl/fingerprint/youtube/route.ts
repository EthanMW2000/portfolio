import { NextRequest, NextResponse } from "next/server";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { requireSession } from "@/lib/auth";
import { buildLambdaClient } from "@/lib/aws";
import { objectExists } from "@/lib/s3";

const YOUTUBE_URL_PATTERN =
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]+/;
const TRACK_ID_PATTERN = /^[a-zA-Z0-9-]+$/;

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const { trackId, youtubeUrl } = (await request.json()) as {
    trackId: string;
    youtubeUrl: string;
  };

  if (!trackId || !TRACK_ID_PATTERN.test(trackId)) {
    return NextResponse.json({ error: "Invalid trackId" }, { status: 400 });
  }

  if (!youtubeUrl || !YOUTUBE_URL_PATTERN.test(youtubeUrl)) {
    return NextResponse.json(
      { error: "Invalid YouTube URL" },
      { status: 400 },
    );
  }

  const lambda = buildLambdaClient();
  const functionName =
    process.env.AUDIO_PROCESSOR_FUNCTION_NAME ?? "audio-processor";

  await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "Event",
      Payload: Buffer.from(JSON.stringify({ trackId, youtubeUrl })),
    }),
  );

  return NextResponse.json({ status: "processing", key: `vinyl/audio/${trackId}.mp3` });
}

export async function GET(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const trackId = new URL(request.url).searchParams.get("trackId");

  if (!trackId || !TRACK_ID_PATTERN.test(trackId)) {
    return NextResponse.json({ error: "Invalid trackId" }, { status: 400 });
  }

  const key = `vinyl/audio/${trackId}.mp3`;
  const exists = await objectExists(key);

  return NextResponse.json({ ready: exists, key });
}
