export function decodeChromaprint(base64: string): number[] {
  const raw = Buffer.from(base64, "base64");
  const values: number[] = [];
  for (let i = 0; i + 3 < raw.length; i += 4) {
    values.push(raw.readUInt32LE(i));
  }
  return values;
}

function popcount32(n: number): number {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24;
}

interface FingerprintCandidate {
  trackId: string;
  recordId: string;
  fingerprint: number[];
}

interface MatchResult {
  trackId: string;
  recordId: string;
  similarity: number;
}

export function compareFingerprints(
  query: number[],
  candidates: FingerprintCandidate[]
): MatchResult | null {
  let bestMatch: MatchResult | null = null;

  for (const candidate of candidates) {
    const len = Math.min(query.length, candidate.fingerprint.length);
    if (len === 0) continue;

    let errorBits = 0;
    let totalBits = 0;

    for (let i = 0; i < len; i++) {
      errorBits += popcount32(query[i] ^ candidate.fingerprint[i]);
      totalBits += 32;
    }

    const similarity = 1 - errorBits / totalBits;

    if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = {
        trackId: candidate.trackId,
        recordId: candidate.recordId,
        similarity,
      };
    }
  }

  return bestMatch;
}
