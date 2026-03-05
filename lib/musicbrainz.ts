const BASE_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_URL = "https://coverartarchive.org";
const USER_AGENT = "EthanWellsPortfolio/1.0 (https://www.ewells.dev)";

export interface MBRelease {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  trackCount: number;
}

export interface MBTrack {
  title: string;
  trackNumber: number;
  discNumber: number;
  duration: number | null;
  recordingMbid: string;
}

async function mbFetch(path: string): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchReleases(query: string): Promise<MBRelease[]> {
  const res = await mbFetch(
    `/release?query=${encodeURIComponent(query)}&fmt=json&limit=10`
  );
  if (!res.ok) return [];

  const data = await res.json();
  const releases = data.releases ?? [];

  return releases.map(
    (r: {
      id: string;
      title: string;
      "artist-credit"?: { name: string }[];
      date?: string;
      "track-count"?: number;
    }) => ({
      id: r.id,
      title: r.title,
      artist: r["artist-credit"]?.[0]?.name ?? "Unknown Artist",
      year: r.date ? parseInt(r.date.slice(0, 4), 10) || null : null,
      trackCount: r["track-count"] ?? 0,
    })
  );
}

export async function getReleaseTracks(
  releaseId: string
): Promise<MBTrack[]> {
  await sleep(1100);
  const res = await mbFetch(
    `/release/${releaseId}?inc=recordings&fmt=json`
  );
  if (!res.ok) return [];

  const data = await res.json();
  const tracks: MBTrack[] = [];

  const media = data.media ?? [];
  for (const disc of media) {
    const discNumber = disc.position ?? 1;
    for (const track of disc.tracks ?? []) {
      tracks.push({
        title: track.title,
        trackNumber: track.position ?? track.number ?? 0,
        discNumber,
        duration: track.length ? Math.round(track.length / 1000) : null,
        recordingMbid: track.recording?.id ?? null,
      });
    }
  }

  return tracks;
}

export async function getCoverArtUrl(
  releaseId: string
): Promise<string | null> {
  try {
    await sleep(1100);
    const res = await fetch(`${COVER_ART_URL}/release/${releaseId}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const front = data.images?.find(
      (img: { front?: boolean }) => img.front
    );
    return front?.image ?? data.images?.[0]?.image ?? null;
  } catch {
    return null;
  }
}
