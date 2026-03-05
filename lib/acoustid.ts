const ACOUSTID_URL = "https://api.acoustid.org/v2/lookup";

export async function lookupFingerprintByMbid(
  recordingMbid: string
): Promise<number[] | null> {
  const apiKey = process.env.ACOUSTID_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      client: apiKey,
      meta: "fingerprints",
      recordingid: recordingMbid,
      format: "json",
    });

    const res = await fetch(
      `${ACOUSTID_URL}?${params.toString()}&lookup_type=recordingid`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const results = data.results ?? [];

    for (const result of results) {
      for (const fingerprint of result.fingerprints ?? []) {
        if (fingerprint.fingerprint) {
          return decodeAcoustIdFingerprint(fingerprint.fingerprint);
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function decodeAcoustIdFingerprint(encoded: string): number[] {
  const raw = Buffer.from(encoded, "base64");
  const values: number[] = [];
  for (let i = 0; i + 3 < raw.length; i += 4) {
    values.push(raw.readUInt32LE(i));
  }
  return values;
}
