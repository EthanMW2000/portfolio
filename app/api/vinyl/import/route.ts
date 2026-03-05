import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireSession } from "@/lib/auth";
import { buildS3Client, bucket, cdnUrl } from "@/lib/aws";
import { getReleaseTracks, getCoverArtUrl } from "@/lib/musicbrainz";
import { createRecord, createTracks } from "@/lib/vinyl";
import type { VinylRecord, VinylTrack } from "@/types";

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { releaseId, title, artist, year } = body as {
    releaseId: string;
    title: string;
    artist: string;
    year: number | null;
  };

  if (!releaseId || !title || !artist) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const recordId = crypto.randomUUID();

    const [mbTracks, coverArtUrl] = await Promise.all([
      getReleaseTracks(releaseId),
      getCoverArtUrl(releaseId),
    ]);

    let coverKey: string | null = null;
    let coverUrl: string | null = null;

    if (coverArtUrl) {
      try {
        const imgRes = await fetch(coverArtUrl);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          coverKey = `vinyl/covers/${recordId}.jpg`;
          const s3 = buildS3Client();
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: coverKey,
              Body: imgBuffer,
              ContentType: "image/jpeg",
            })
          );
          coverUrl = cdnUrl(coverKey);
        }
      } catch (err) {
        console.error("Cover art upload failed:", err);
      }
    }

    const tracks: VinylTrack[] = mbTracks.map((t) => ({
      id: crypto.randomUUID(),
      recordId,
      title: t.title,
      trackNumber: t.trackNumber,
      discNumber: t.discNumber,
      duration: t.duration,
      mbid: t.recordingMbid,
    }));

    const record: VinylRecord = {
      id: recordId,
      title,
      artist,
      year,
      mbid: releaseId,
      coverKey,
      coverUrl,
      trackCount: tracks.length,
      createdAt: new Date().toISOString(),
    };

    await createRecord(record);
    if (tracks.length > 0) {
      await createTracks(tracks);
    }

    return NextResponse.json({
      record,
      tracksImported: tracks.length,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: "Failed to import record" },
      { status: 500 }
    );
  }
}
