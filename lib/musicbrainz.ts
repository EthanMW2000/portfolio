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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mbFetch(path: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (res.status !== 503 || attempt === 3) return res;
    await sleep(1500 * attempt);
  }
}

function parseReleases(releases: unknown[]): MBRelease[] {
  return (releases as {
    id: string;
    title: string;
    "artist-credit"?: { name: string }[];
    date?: string;
    "track-count"?: number;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    artist: r["artist-credit"]?.[0]?.name ?? "Unknown Artist",
    year: r.date ? parseInt(r.date.slice(0, 4), 10) || null : null,
    trackCount: r["track-count"] ?? 0,
  }));
}

export async function searchReleases(
  query: string,
  artist?: string,
): Promise<MBRelease[]> {
  let lucene = query;
  if (artist) {
    lucene = `release:"${query}" AND artist:"${artist}"`;
  }

  const res = await mbFetch(
    `/release?query=${encodeURIComponent(lucene)}&fmt=json&limit=25`
  );
  if (!res.ok) return [];

  const data = await res.json();
  return parseReleases(data.releases ?? []);
}

export async function searchArtistReleases(
  artist: string,
): Promise<MBRelease[]> {
  const artistRes = await mbFetch(
    `/artist?query=${encodeURIComponent(artist)}&fmt=json&limit=1`
  );
  if (!artistRes.ok) return [];

  const artistData = await artistRes.json();
  const artistId = artistData.artists?.[0]?.id;
  if (!artistId) return [];

  await sleep(1100);

  const res = await mbFetch(
    `/release?artist=${artistId}&type=album&fmt=json&limit=100`
  );
  if (!res.ok) return [];

  const data = await res.json();
  return parseReleases(data.releases ?? []);
}

export interface MBCandidate extends MBRelease {
  country: string | null;
  format: string | null;
  label: string | null;
  catalogNumber: string | null;
  barcode: string | null;
  inCollection?: boolean;
}

export type LookupMatch = "barcode" | "catalogNumber" | "search" | "none";

export interface LookupQuery {
  barcode?: string | null;
  catalogNumber?: string | null;
  artist?: string | null;
  title?: string | null;
}

interface MBSearchRelease {
  id: string;
  title: string;
  "artist-credit"?: { name: string; joinphrase?: string }[];
  date?: string;
  "track-count"?: number;
  country?: string;
  status?: string;
  barcode?: string;
  media?: { format?: string }[];
  "label-info"?: { "catalog-number"?: string; label?: { name?: string } }[];
}

function artistCredit(credit: MBSearchRelease["artist-credit"]): string {
  if (!credit?.length) return "Unknown Artist";
  return credit.map((c) => `${c.name}${c.joinphrase ?? ""}`).join("").trim();
}

function formatSummary(media: MBSearchRelease["media"]): string | null {
  const formats = (media ?? []).map((m) => m.format).filter(Boolean) as string[];
  if (formats.length === 0) return null;
  const counts = new Map<string, number>();
  for (const f of formats) counts.set(f, (counts.get(f) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([f, n]) => (n > 1 ? `${n}×${f}` : f))
    .join(" + ");
}

function parseCandidates(releases: MBSearchRelease[]): MBCandidate[] {
  return releases.map((r) => {
    const labelInfo = r["label-info"]?.find((l) => l["catalog-number"] || l.label?.name);
    return {
      id: r.id,
      title: r.title,
      artist: artistCredit(r["artist-credit"]),
      year: r.date ? parseInt(r.date.slice(0, 4), 10) || null : null,
      trackCount: r["track-count"] ?? 0,
      country: r.country ?? null,
      format: formatSummary(r.media),
      label: labelInfo?.label?.name ?? null,
      catalogNumber: labelInfo?.["catalog-number"] ?? null,
      barcode: r.barcode || null,
    };
  });
}

function lucene(value: string): string {
  return `"${value.replace(/["\\]/g, " ").trim()}"`;
}

function normalizeCatalog(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function searchCandidates(query: string): Promise<MBCandidate[]> {
  const res = await mbFetch(
    `/release?query=${encodeURIComponent(query)}&fmt=json&limit=50`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return parseCandidates(data.releases ?? []);
}

function rankCandidates(candidates: MBCandidate[], query: LookupQuery): MBCandidate[] {
  const catno = normalizeCatalog(query.catalogNumber);
  const title = normalizeName(query.title ?? "");
  const artist = normalizeName(query.artist ?? "");
  const score = (c: MBCandidate) =>
    (title && normalizeName(c.title) === title ? 8 : 0) +
    (artist && looselyEqual(c.artist, artist) ? 8 : 0) +
    (c.format?.toLowerCase().includes("vinyl") ? 4 : 0) +
    (catno && normalizeCatalog(c.catalogNumber) === catno ? 2 : 0) +
    (c.barcode ? 1 : 0);
  return [...candidates].sort((a, b) => score(b) - score(a));
}

export async function lookupReleases(
  query: LookupQuery
): Promise<{ candidates: MBCandidate[]; matchedBy: LookupMatch }> {
  const barcode = (query.barcode ?? "").replace(/\D/g, "");
  const catalogNumber = query.catalogNumber?.trim();
  const artist = query.artist?.trim();
  const title = query.title?.trim();
  let searched = false;

  const run = async (q: string) => {
    if (searched) await sleep(1100);
    searched = true;
    return searchCandidates(q);
  };

  if (barcode.length >= 8) {
    const variants = new Set([barcode]);
    if (barcode.length === 12) variants.add(`0${barcode}`);
    if (barcode.length === 13 && barcode.startsWith("0")) variants.add(barcode.slice(1));
    const found = await run(
      Array.from(variants).map((b) => `barcode:${b}`).join(" OR ")
    );
    if (found.length > 0) {
      return { candidates: rankCandidates(found, query), matchedBy: "barcode" };
    }
  }

  if (catalogNumber) {
    const q = `catno:${lucene(catalogNumber)}${artist ? ` AND artist:${lucene(artist)}` : ""}`;
    const found = await run(q);
    if (found.length > 0) {
      return { candidates: rankCandidates(found, query), matchedBy: "catalogNumber" };
    }
  }

  if (title) {
    const q = `release:${lucene(title)}${artist ? ` AND artist:${lucene(artist)}` : ""}`;
    const found = await run(q);
    if (found.length > 0) {
      return {
        candidates: rankCandidates(found, query).slice(0, 15),
        matchedBy: "search",
      };
    }
  }

  return { candidates: [], matchedBy: "none" };
}

export interface MBReleaseDetails {
  tracks: MBTrack[];
  releaseGroupId: string | null;
}

export async function getReleaseTracks(
  releaseId: string
): Promise<MBTrack[]> {
  return (await getReleaseDetails(releaseId)).tracks;
}

export async function getReleaseDetails(
  releaseId: string
): Promise<MBReleaseDetails> {
  await sleep(1100);
  const res = await mbFetch(
    `/release/${releaseId}?inc=recordings+release-groups&fmt=json`
  );
  if (!res.ok) throw new Error(`MusicBrainz release lookup failed (${res.status})`);

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

  return { tracks, releaseGroupId: data["release-group"]?.id ?? null };
}

interface CoverArtImage {
  front?: boolean;
  image?: string;
  thumbnails?: Record<string, string>;
}

async function coverArtArchiveFront(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${COVER_ART_URL}/${path}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const images = (data.images ?? []) as CoverArtImage[];
    const front = images.find((img) => img.front) ?? images[0];
    if (!front) return null;
    const url = front.thumbnails?.["1200"] ?? front.thumbnails?.large ?? front.image;
    return url ? url.replace(/^http:/, "https:") : null;
  } catch {
    return null;
  }
}

export async function getCoverArtUrl(
  releaseId: string
): Promise<string | null> {
  await sleep(1100);
  return coverArtArchiveFront(`release/${releaseId}`);
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function looselyEqual(a: string, b: string): boolean {
  const x = normalizeName(a);
  const y = normalizeName(b);
  return x.length > 0 && y.length > 0 && (x.includes(y) || y.includes(x));
}

export async function getItunesArtworkUrl(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      term: `${artist} ${title}`,
      media: "music",
      entity: "album",
      limit: "25",
    });
    const res = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const results = (data.results ?? []) as {
      collectionName?: string;
      artistName?: string;
      artworkUrl100?: string;
    }[];
    const various = /various/i.test(artist);
    const match = results.find(
      (r) =>
        r.artworkUrl100 &&
        r.collectionName &&
        looselyEqual(r.collectionName, title) &&
        (various || (r.artistName && looselyEqual(r.artistName, artist)))
    );
    return match?.artworkUrl100?.replace(/\/\d+x\d+bb\./, "/1200x1200bb.") ?? null;
  } catch {
    return null;
  }
}

export type CoverSource = "coverartarchive" | "itunes";

export async function findCoverArt(
  releaseId: string,
  releaseGroupId: string | null,
  artist: string,
  title: string
): Promise<{ url: string; source: CoverSource } | null> {
  const release = await getCoverArtUrl(releaseId);
  if (release) return { url: release, source: "coverartarchive" };

  if (releaseGroupId) {
    const group = await coverArtArchiveFront(`release-group/${releaseGroupId}`);
    if (group) return { url: group, source: "coverartarchive" };
  }

  const itunes = await getItunesArtworkUrl(artist, title);
  if (itunes) return { url: itunes, source: "itunes" };

  return null;
}
