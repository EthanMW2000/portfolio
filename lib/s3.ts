import { HeadObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import exifr from "exifr";
import type { ExifData, Photo } from "@/types";
import { buildS3Client, bucket, cdnUrl } from "@/lib/aws";

const s3 = buildS3Client();
const thumbnailPrefix = process.env.S3_THUMBNAIL_PREFIX!;
const webPrefix = process.env.S3_WEB_PREFIX!;

export async function listFolder(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const response = await s3.send(command);
    const objects = response.Contents ?? [];

    for (const obj of objects) {
      if (obj.Key && obj.Key !== prefix) {
        keys.push(obj.Key);
      }
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

export async function listAlbumFolders(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: thumbnailPrefix,
    Delimiter: "/",
  });
  const response = await s3.send(command);
  const prefixes = response.CommonPrefixes ?? [];

  return prefixes
    .map((p) => p.Prefix!)
    .filter(Boolean)
    .map((p) => p.replace(thumbnailPrefix, "").replace(/\/$/, ""));
}

export async function parseExif(url: string): Promise<ExifData> {
  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(buffer).metadata();

    if (!metadata.exif) return emptyExif();

    const header = Buffer.from([0xff, 0xd8, 0xff, 0xe1]);
    const len = Buffer.alloc(2);
    len.writeUInt16BE(metadata.exif.length + 2);
    const footer = Buffer.from([0xff, 0xd9]);
    const wrappedExif = Buffer.concat([header, len, metadata.exif, footer]);

    const raw = await exifr.parse(wrappedExif);
    if (!raw) return emptyExif();

    return {
      camera: raw.Model ?? raw.Make ?? null,
      focalLength: raw.FocalLength ? `${raw.FocalLength}mm` : null,
      aperture: raw.FNumber ? `f/${raw.FNumber}` : null,
      shutterSpeed: formatShutterSpeed(raw.ExposureTime),
      iso: raw.ISO ?? null,
      dateTaken: raw.DateTimeOriginal?.toISOString() ?? null,
    };
  } catch {
    return emptyExif();
  }
}

function formatShutterSpeed(exposureTime: number | undefined): string | null {
  if (!exposureTime) return null;
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}s`;
}

function emptyExif(): ExifData {
  return {
    camera: null,
    focalLength: null,
    aperture: null,
    shutterSpeed: null,
    iso: null,
    dateTaken: null,
  };
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function getUploadPresignedUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

function extractAlbum(key: string): string {
  const withoutPrefix = key
    .replace(thumbnailPrefix, "")
    .replace(webPrefix, "");
  const parts = withoutPrefix.split("/");
  return parts.length > 1 ? parts[0] : "";
}

export function buildPhoto(thumbnailKey: string): Photo {
  const webKey = thumbnailKey.replace(thumbnailPrefix, webPrefix);

  return {
    key: thumbnailKey,
    thumbnailUrl: cdnUrl(thumbnailKey),
    webUrl: cdnUrl(webKey),
    exif: emptyExif(),
    album: extractAlbum(thumbnailKey),
  };
}
