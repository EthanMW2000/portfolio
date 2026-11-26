"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AlbumIcon from "@mui/icons-material/Album";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { VinylRecord } from "@/types";
import type { MBCandidate, MBTrack, LookupMatch, CoverSource } from "@/lib/musicbrainz";
import type { RecordPhotoInfo } from "@/lib/claude";

interface Photo {
  preview: string;
  data: string;
  mediaType: string;
}

interface Preview {
  tracks: MBTrack[];
  coverArtUrl: string | null;
  coverSource: CoverSource | null;
}

const MAX_EDGE = 1568;

async function resizePhoto(file: File): Promise<Photo> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't open that photo"));
      el.src = url;
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { preview: dataUrl, data: dataUrl.split(",")[1], mediaType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

const MATCH_LABEL: Record<LookupMatch, string> = {
  barcode: "Matched by barcode",
  catalogNumber: "Matched by catalog number",
  search: "Matched by artist and title",
  none: "No match",
};

function PhotoButton({
  label,
  hint,
  icon,
  photo,
  onPick,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  photo: Photo | null;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Box sx={{ flex: 1 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
      <Box
        component="button"
        type="button"
        onClick={() => inputRef.current?.click()}
        sx={{
          width: "100%",
          aspectRatio: "1",
          border: 2,
          borderStyle: photo ? "solid" : "dashed",
          borderColor: photo ? "secondary.main" : "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.secondary",
          p: 0,
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          font: "inherit",
        }}
      >
        {photo ? (
          <img src={photo.preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            {icon}
            <Typography variant="subtitle1" color="text.primary">
              {label}
            </Typography>
            <Typography variant="caption">{hint}</Typography>
          </>
        )}
      </Box>
      {photo && (
        <Button size="small" color="secondary" fullWidth onClick={() => inputRef.current?.click()}>
          Retake {label.toLowerCase()}
        </Button>
      )}
    </Box>
  );
}

function CandidateCover({ id, size }: { id: string; size: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {failed ? (
        <AlbumIcon sx={{ color: "text.disabled" }} />
      ) : (
        <img
          src={`https://coverartarchive.org/release/${id}/front-250`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: size, height: size, objectFit: "cover" }}
        />
      )}
    </Box>
  );
}

export default function VinylScan() {
  const [front, setFront] = useState<Photo | null>(null);
  const [back, setBack] = useState<Photo | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<RecordPhotoInfo | null>(null);
  const [candidates, setCandidates] = useState<MBCandidate[] | null>(null);
  const [matchedBy, setMatchedBy] = useState<LookupMatch>("none");
  const [selected, setSelected] = useState<MBCandidate | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [added, setAdded] = useState<{ record: VinylRecord; tracksImported: number } | null>(null);

  async function pick(setter: (p: Photo) => void, file: File) {
    setError(null);
    try {
      setter(await resizePhoto(file));
      setExtracted(null);
      setCandidates(null);
      setMatchedBy("none");
      setSelected(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open that photo");
    }
  }

  async function select(candidate: MBCandidate) {
    setSelected(candidate);
    setPreview(null);
    setBusy("Loading tracks and cover art…");
    setError(null);
    try {
      const params = new URLSearchParams({
        id: candidate.id,
        artist: candidate.artist,
        title: candidate.title,
      });
      const res = await fetch(`/api/vinyl/preview?${params}`);
      if (!res.ok) throw new Error();
      setPreview(await res.json());
    } catch {
      setError("Couldn't load that release. Try again or pick another.");
    } finally {
      setBusy(null);
    }
  }

  async function runLookup(body: object, message: string) {
    setBusy(message);
    setError(null);
    setCandidates(null);
    setSelected(null);
    setPreview(null);
    try {
      const res = await fetch("/api/vinyl/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (data.extracted) setExtracted(data.extracted);
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      setCandidates(data.candidates);
      setMatchedBy(data.matchedBy);
      setBusy(null);
      if (data.candidates.length === 1) await select(data.candidates[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
      setBusy(null);
    }
  }

  function identify() {
    if (!front) return;
    const images = [front, back].filter(Boolean).map((p) => ({ data: p!.data, mediaType: p!.mediaType }));
    runLookup({ images }, "Reading the sleeve and searching MusicBrainz…");
  }

  function searchAgain() {
    if (!extracted) return;
    runLookup({ lookup: extracted }, "Searching MusicBrainz…");
  }

  async function addRecord() {
    if (!selected) return;
    setBusy("Adding to your collection…");
    setError(null);
    try {
      const res = await fetch("/api/vinyl/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseId: selected.id,
          title: selected.title,
          artist: selected.artist,
          year: selected.year,
          fallbackCover: front ? { data: front.data, mediaType: front.mediaType } : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setAdded(await res.json());
    } catch {
      setError("Couldn't add the record. Try again.");
    } finally {
      setBusy(null);
    }
  }

  function reset() {
    setFront(null);
    setBack(null);
    setExtracted(null);
    setCandidates(null);
    setSelected(null);
    setPreview(null);
    setAdded(null);
    setError(null);
  }

  const field = (key: keyof RecordPhotoInfo, label: string, numeric = false) => (
    <TextField
      label={label}
      size="small"
      fullWidth
      value={extracted?.[key] ?? ""}
      onChange={(e) => setExtracted((prev) => ({ ...prev!, [key]: e.target.value || null }))}
      inputProps={numeric ? { inputMode: "numeric" } : undefined}
      helperText={key === "artist" && !extracted?.artist ? "Not read from the photo. Type it for better matches." : undefined}
    />
  );

  const discs = new Map<number, MBTrack[]>();
  for (const t of preview?.tracks ?? []) {
    discs.set(t.discNumber, [...(discs.get(t.discNumber) ?? []), t]);
  }

  const card = { p: { xs: 2, sm: 3 }, mb: 2, border: 1, borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary", display: "flex", justifyContent: "center", p: { xs: 1.5, sm: 4 }, pt: { xs: 2, sm: 6 } }}>
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Button component={Link} href="/admin/vinyl" color="secondary" startIcon={<ArrowBackIcon />} size="small">
            Collection
          </Button>
        </Stack>
        <Typography variant="h4" color="text.primary" sx={{ mb: 2, fontSize: { xs: "1.75rem", sm: "2.5rem" } }}>
          Add a record
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {added ? (
          <Box sx={card}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              {added.record.coverUrl ? (
                <img src={added.record.coverUrl} alt="" style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }} />
              ) : (
                <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
              )}
              <Typography variant="h6">
                Added {added.record.title}
              </Typography>
              <Typography color="text.secondary">
                {added.record.artist} · {added.tracksImported} tracks. The NAS will fingerprint it automatically.
              </Typography>
              <Button variant="contained" color="secondary" fullWidth size="large" startIcon={<PhotoCameraIcon />} onClick={reset}>
                Add another
              </Button>
              <Button component={Link} href="/admin/vinyl" color="secondary" fullWidth>
                View collection
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Box sx={card}>
              <Stack direction="row" spacing={1.5}>
                <PhotoButton
                  label="Front cover"
                  hint="Required"
                  icon={<PhotoCameraIcon sx={{ fontSize: 40 }} />}
                  photo={front}
                  onPick={(f) => pick(setFront, f)}
                />
                <PhotoButton
                  label="Back"
                  hint="Optional: barcode"
                  icon={<QrCodeScannerIcon sx={{ fontSize: 40 }} />}
                  photo={back}
                  onPick={(f) => pick(setBack, f)}
                />
              </Stack>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!front || busy !== null}
                onClick={identify}
                startIcon={<SearchIcon />}
              >
                Identify record
              </Button>
            </Box>

            {busy && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress color="secondary" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {busy}
                </Typography>
              </Box>
            )}

            {extracted && (
              <Box sx={card}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Read from the photo. Fix anything wrong and search again.
                </Typography>
                <Stack spacing={1.5}>
                  {field("artist", "Artist")}
                  {field("title", "Title")}
                  <Stack direction="row" spacing={1.5}>
                    {field("barcode", "Barcode", true)}
                    {field("catalogNumber", "Catalog #")}
                  </Stack>
                  <Button variant="outlined" color="secondary" onClick={searchAgain} disabled={busy !== null} startIcon={<SearchIcon />}>
                    Search again
                  </Button>
                </Stack>
              </Box>
            )}

            {candidates && (
              <Box sx={card}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">
                    {candidates.length === 0
                      ? "No releases found"
                      : candidates.length === 1
                        ? "1 release"
                        : `${candidates.length} releases — pick yours`}
                  </Typography>
                  {candidates.length > 0 && <Chip size="small" label={MATCH_LABEL[matchedBy]} />}
                </Stack>
                {candidates.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Check the artist and title above, or add a barcode, then search again.
                  </Typography>
                )}
                <Stack spacing={1}>
                  {candidates.map((c) => {
                    const isSelected = selected?.id === c.id;
                    const details = [c.year, c.country, c.format, [c.label, c.catalogNumber].filter(Boolean).join(" ")]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <Box
                        key={c.id}
                        component="button"
                        type="button"
                        onClick={() => select(c)}
                        disabled={busy !== null}
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                          textAlign: "left",
                          width: "100%",
                          p: 1,
                          border: 2,
                          borderColor: isSelected ? "secondary.main" : "divider",
                          borderRadius: 2,
                          bgcolor: "transparent",
                          color: "text.primary",
                          cursor: "pointer",
                          font: "inherit",
                        }}
                      >
                        <CandidateCover id={c.id} size={56} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body1" noWrap>
                            {c.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {c.artist} · {c.trackCount} tracks
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {details}
                          </Typography>
                          {c.inCollection && (
                            <Chip
                              size="small"
                              color="warning"
                              label={c.inCollection === "release" ? "Already in collection" : "You have another pressing"}
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {selected && preview && (
              <Box sx={card}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <img
                    src={preview.coverArtUrl ?? front?.preview}
                    alt=""
                    style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6">{selected.title}</Typography>
                    <Typography color="text.secondary">{selected.artist}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cover:{" "}
                      {preview.coverSource === "coverartarchive"
                        ? "Cover Art Archive"
                        : preview.coverSource === "itunes"
                          ? "Apple Music"
                          : "your photo"}
                    </Typography>
                  </Box>
                </Stack>
                {Array.from(discs.entries()).map(([disc, tracks]) => (
                  <Box key={disc} sx={{ mb: 1 }}>
                    {discs.size > 1 && (
                      <Typography variant="caption" color="text.secondary">
                        Disc {disc}
                      </Typography>
                    )}
                    {tracks.map((t) => (
                      <Stack key={`${disc}-${t.trackNumber}`} direction="row" spacing={1} sx={{ py: 0.25 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 24, flexShrink: 0 }}>
                          {t.trackNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                          {t.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(t.duration)}
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                ))}
                {preview.tracks.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    MusicBrainz has no tracklist for this release. Pick another one.
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={busy !== null || preview.tracks.length === 0}
                  onClick={addRecord}
                  startIcon={<AlbumIcon />}
                >
                  Add to collection ({preview.tracks.length} tracks)
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
