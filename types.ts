export interface ExifData {
  camera: string | null;
  focalLength: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: number | null;
  dateTaken: string | null;
}

export interface Photo {
  key: string;
  thumbnailUrl: string;
  webUrl: string;
  exif: ExifData;
  album: string;
}

export interface Album {
  name: string;
  slug: string;
  coverPhoto: Photo | null;
  photoCount: number;
}

export interface AlbumsResponse {
  albums: Album[];
}

export interface PhotosResponse {
  photos: Photo[];
  album?: string;
}
