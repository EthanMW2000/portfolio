const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5-5";

export interface RecordPhotoInfo {
  artist: string | null;
  title: string | null;
  barcode: string | null;
  catalogNumber: string | null;
  label: string | null;
}

const PROMPT = `These are photos of a vinyl record sleeve: the front cover, and possibly the back.
Read what is printed on them.
- artist and title: as printed on the sleeve. If the artist isn't printed but you clearly recognize the album cover, give the artist. For soundtracks or compilations with no single artist, use the composer if credited, else "Various Artists".
- barcode: the UPC/EAN digits printed under the barcode (digits only), or null if no barcode is readable.
- catalogNumber: the label's catalog number (often on the spine or back, e.g. "XL 540", "B0012345-01"), or null.
- label: the record label name, or null.
Use null for anything you can't read; don't guess.`;

export async function readRecordPhotos(
  images: { data: string; mediaType: string }[]
): Promise<RecordPhotoInfo> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              artist: { type: ["string", "null"] },
              title: { type: ["string", "null"] },
              barcode: { type: ["string", "null"] },
              catalogNumber: { type: ["string", "null"] },
              label: { type: ["string", "null"] },
            },
            required: ["artist", "title", "barcode", "catalogNumber", "label"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            ...images.map((img) => ({
              type: "image",
              source: { type: "base64", media_type: img.mediaType, data: img.data },
            })),
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = await res.json();
  const text = (data.content ?? []).find(
    (c: { type: string }) => c.type === "text"
  )?.text;
  const input = JSON.parse(text ?? "{}") as Partial<RecordPhotoInfo>;
  const clean = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  return {
    artist: clean(input.artist),
    title: clean(input.title),
    barcode: clean(input.barcode)?.replace(/\D/g, "") || null,
    catalogNumber: clean(input.catalogNumber),
    label: clean(input.label),
  };
}
