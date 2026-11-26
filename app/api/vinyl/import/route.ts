import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireSession } from "@/lib/auth";
import { buildS3Client, bucket, cdnUrl } from "@/lib/aws";
import { getReleaseDetails, findCoverArt } from "@/lib/musicbrainz";
import { createRecord, createTracks } from "@/lib/vinyl";
import type { VinylRecord, VinylTrack } from "@/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = await request.json();
  const { releaseId, title, artist, year, fallbackCover } = body as {
    releaseId: string;
    title: string;
    artist: string;
    year: number | null;
    fallbackCover?: { data: string; mediaType: string };
  };

  if (!releaseId || !title || !artist) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const recordId = crypto.randomUUID();

    const { tracks: mbTracks, releaseGroupId } = await getReleaseDetails(releaseId);
    const coverArt = await findCoverArt(releaseId, releaseGroupId, artist, title);

    let coverKey: string | null = null;
    let coverUrl: string | null = null;

    const uploadCover = async (body: Buffer, contentType: string) => {
      const key = `vinyl/covers/${recordId}.jpg`;
      await buildS3Client().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
      coverKey = key;
      coverUrl = cdnUrl(key);
    };

    if (coverArt) {
      try {
        const imgRes = await fetch(coverArt.url);
        if (imgRes.ok) {
          await uploadCover(Buffer.from(await imgRes.arrayBuffer()), "image/jpeg");
        }
      } catch (err) {
        console.error("Cover art upload failed:", err);
      }
    }

    if (!coverKey && fallbackCover?.data && /^image\/(jpeg|png|webp)$/.test(fallbackCover.mediaType)) {
      try {
        await uploadCover(Buffer.from(fallbackCover.data, "base64"), fallbackCover.mediaType);
      } catch (err) {
        console.error("Photo cover upload failed:", err);
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
