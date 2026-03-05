import {
  listFolder,
  listAlbumFolders,
  buildPhoto,
} from "@/lib/s3";
import type { Album, Photo } from "@/types";

const thumbnailPrefix = process.env.S3_THUMBNAIL_PREFIX!;

export async function getAlbums(): Promise<Album[]> {
  const albumNames = await listAlbumFolders();

  const albums = await Promise.all(
    albumNames.map(async (name) => {
      const prefix = `${thumbnailPrefix}${name}/`;
      const keys = await listFolder(prefix);

      return {
        name: formatAlbumName(name),
        slug: name,
        coverPhoto: keys.length > 0 ? buildPhoto(keys[0]) : null,
        photoCount: keys.length,
      };
    })
  );

  return albums.filter((a) => a.photoCount > 0);
}

export async function getAlbumPhotos(album: string): Promise<Photo[]> {
  const prefix = `${thumbnailPrefix}${album}/`;
  const keys = await listFolder(prefix);
  return keys.map(buildPhoto);
}

export async function getAllPhotos(): Promise<Photo[]> {
  const keys = await listFolder(thumbnailPrefix);
  return keys.map(buildPhoto);
}

function formatAlbumName(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
