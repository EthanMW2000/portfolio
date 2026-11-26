import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { readRecordPhotos, type RecordPhotoInfo } from "@/lib/claude";
import { lookupReleases, normalizeName as normalize } from "@/lib/musicbrainz";
import { getAllRecords } from "@/lib/vinyl";

export const maxDuration = 60;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ScanImage {
  data: string;
  mediaType: string;
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = await requireSession(request);
  if (sessionOrResponse instanceof NextResponse) return sessionOrResponse;

  const body = (await request.json()) as {
    images?: ScanImage[];
    lookup?: Partial<RecordPhotoInfo>;
  };

  let extracted: RecordPhotoInfo;

  if (body.images?.length) {
    const images = body.images.slice(0, 2);
    if (images.some((img) => !img.data || !IMAGE_TYPES.includes(img.mediaType))) {
      return NextResponse.json({ error: "Unsupported image" }, { status: 400 });
    }
    try {
      extracted = await readRecordPhotos(images);
    } catch (err) {
      console.error("Claude vision error:", err);
      return NextResponse.json(
        { error: "Couldn't read the photo" },
        { status: 502 }
      );
    }
  } else if (body.lookup) {
    extracted = {
      artist: body.lookup.artist?.trim() || null,
      title: body.lookup.title?.trim() || null,
      barcode: body.lookup.barcode?.replace(/\D/g, "") || null,
      catalogNumber: body.lookup.catalogNumber?.trim() || null,
      label: body.lookup.label?.trim() || null,
    };
  } else {
    return NextResponse.json({ error: "Missing images" }, { status: 400 });
  }

  try {
    const [{ candidates, matchedBy }, records] = await Promise.all([
      lookupReleases(extracted),
      getAllRecords().catch((err) => {
        console.error("Collection lookup failed:", err);
        return [];
      }),
    ]);

    const owned = new Set(records.map((r) => r.mbid).filter(Boolean));
    const ownedNames = new Set(
      records.map((r) => `${normalize(r.artist)}|${normalize(r.title)}`)
    );

    return NextResponse.json({
      extracted,
      matchedBy,
      candidates: candidates.map((c) => ({
        ...c,
        inCollection: owned.has(c.id)
          ? "release"
          : ownedNames.has(`${normalize(c.artist)}|${normalize(c.title)}`)
            ? "album"
            : undefined,
      })),
    });
  } catch (err) {
    console.error("Release lookup error:", err);
    return NextResponse.json(
      { error: "MusicBrainz didn't answer. Tap Search again in a moment.", extracted },
      { status: 502 }
    );
  }
}
