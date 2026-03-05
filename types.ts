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

export interface VinylRecord {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  mbid: string;
  coverKey: string | null;
  coverUrl: string | null;
  trackCount: number;
  createdAt: string;
}

export interface VinylTrack {
  id: string;
  recordId: string;
  title: string;
  trackNumber: number;
  discNumber: number;
  duration: number | null;
  mbid: string | null;
}

export interface VinylRecordWithTracks extends VinylRecord {
  tracks: VinylTrack[];
}

export interface VinylCollectionStats {
  totalRecords: number;
  totalTracks: number;
  uniqueArtists: number;
}
