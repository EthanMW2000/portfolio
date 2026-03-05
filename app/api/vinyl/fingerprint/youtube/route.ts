import { NextRequest, NextResponse } from "next/server";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { requireSession } from "@/lib/auth";
import { buildLambdaClient } from "@/lib/aws";

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

  const response = await lambda.send(
    new InvokeCommand({
      FunctionName: functionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({ trackId, youtubeUrl })),
    }),
  );

  if (response.FunctionError) {
    return NextResponse.json(
      { error: "Lambda execution failed" },
      { status: 502 },
    );
  }

  const result = JSON.parse(Buffer.from(response.Payload!).toString());

  if (result.status !== "ok") {
    return NextResponse.json(
      { error: result.error ?? "Processing failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ status: "ok", key: result.key });
}
