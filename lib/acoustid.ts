const ACOUSTID_URL = "https://api.acoustid.org/v2/lookup";

export interface AcoustIdMatch {
  recordingMbid: string;
  score: number;
}

export async function lookupByFingerprint(
  fingerprint: string,
  duration: number
): Promise<AcoustIdMatch[]> {
  const apiKey = process.env.ACOUSTID_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(ACOUSTID_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client: apiKey,
        meta: "recordings",
        fingerprint,
        duration: String(Math.round(duration)),
        format: "json",
      }),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const matches: AcoustIdMatch[] = [];

    for (const result of data.results ?? []) {
      for (const recording of result.recordings ?? []) {
        if (recording.id) {
          matches.push({
            recordingMbid: recording.id,
            score: result.score ?? 0,
          });
        }
      }
    }

    return matches;
  } catch {
    return [];
  }
}
