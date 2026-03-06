"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Divider,
  LinearProgress,
} from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import type { VinylRecordWithTracks, VinylTrack } from "@/types";

interface Props {
  record: VinylRecordWithTracks;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: VinylRecordWithTracks) => void;
}

interface TrackEdit {
  id: string;
  title: string;
  trackNumber: number;
}

export default function VinylEditModal({ record, open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(record.title);
  const [artist, setArtist] = useState(record.artist);
  const [year, setYear] = useState(record.year?.toString() ?? "");
  const [tracks, setTracks] = useState<TrackEdit[]>(
    record.tracks.map((t) => ({ id: t.id, title: t.title, trackNumber: t.trackNumber }))
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const multiDisc = record.tracks.some((t) => t.discNumber > 1);

  const tracksByDisc = record.tracks.reduce<Record<number, VinylTrack[]>>((acc, t) => {
    (acc[t.discNumber] ??= []).push(t);
    return acc;
  }, {});

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function updateTrackTitle(trackId: string, value: string) {
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, title: value } : t)));
  }

  function getChangedAlbumFields() {
    const fields: Record<string, unknown> = {};
    if (title !== record.title) fields.title = title;
    if (artist !== record.artist) fields.artist = artist;
    const parsedYear = year ? parseInt(year, 10) : null;
    if (parsedYear !== record.year) fields.year = parsedYear;
    return fields;
  }

  function getChangedTracks(): { id: string; title?: string; trackNumber?: number }[] {
    const changed: { id: string; title?: string; trackNumber?: number }[] = [];
    for (const edited of tracks) {
      const original = record.tracks.find((t: VinylTrack) => t.id === edited.id);
      if (!original) continue;
      const diff: { id: string; title?: string; trackNumber?: number } = { id: edited.id };
      let hasChange = false;
      if (edited.title !== original.title) {
        diff.title = edited.title;
        hasChange = true;
      }
      if (edited.trackNumber !== original.trackNumber) {
        diff.trackNumber = edited.trackNumber;
        hasChange = true;
      }
      if (hasChange) changed.push(diff);
    }
    return changed;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const albumFields = getChangedAlbumFields();

      if (coverFile) {
        const presignRes = await fetch("/api/vinyl/cover/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: record.id, contentType: coverFile.type }),
        });
        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, key, coverUrl } = await presignRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: coverFile,
          headers: { "Content-Type": coverFile.type },
        });

        albumFields.coverKey = key;
        albumFields.coverUrl = coverUrl;
      }

      let updatedRecord = record;

      if (Object.keys(albumFields).length > 0) {
        const patchRes = await fetch(`/api/vinyl/${record.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(albumFields),
        });
        if (!patchRes.ok) throw new Error("Failed to update album");
        updatedRecord = await patchRes.json();
      }

      const changedTracks = getChangedTracks();
      if (changedTracks.length > 0) {
        const trackRes = await fetch(`/api/vinyl/${record.id}/tracks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks: changedTracks }),
        });
        if (!trackRes.ok) throw new Error("Failed to update tracks");

        updatedRecord = {
          ...updatedRecord,
          tracks: record.tracks.map((t) => {
            const edited = tracks.find((e) => e.id === t.id);
            return edited ? { ...t, title: edited.title, trackNumber: edited.trackNumber } : t;
          }),
        };
      }

      onSaved(updatedRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const displayCover = coverPreview ?? record.coverUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          divider={<Divider orientation="vertical" flexItem />}
          sx={{ flex: 1, overflow: "hidden" }}
        >
          <Box sx={{ width: { md: 300 }, flexShrink: 0, p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, mb: 3 }}>
              {displayCover ? (
                <img
                  src={displayCover}
                  alt={title}
                  style={{ width: 250, height: 250, objectFit: "cover", borderRadius: 12 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 250,
                    height: 250,
                    bgcolor: "action.hover",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlbumIcon sx={{ fontSize: 80, color: "text.secondary" }} />
                </Box>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleCoverSelect} />
              <Button
                size="small"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileInputRef.current?.click()}
                color="secondary"
              >
                Replace Cover
              </Button>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                size="small"
                fullWidth
                inputProps={{ inputMode: "numeric" }}
              />
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tracks
            </Typography>

            {Object.entries(tracksByDisc)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([discNum, discTracks]) => (
                <Box key={discNum} sx={{ mb: 2 }}>
                  {multiDisc && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Disc {discNum}
                    </Typography>
                  )}
                  {discTracks.map((track, i) => {
                    const editTrack = tracks.find((t) => t.id === track.id);
                    return (
                      <Stack
                        key={track.id}
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ width: 28, textAlign: "right", flexShrink: 0 }}
                        >
                          {track.trackNumber}
                        </Typography>
                        <TextField
                          value={editTrack?.title ?? track.title}
                          onChange={(e) => updateTrackTitle(track.id, e.target.value)}
                          variant="standard"
                          fullWidth
                          InputProps={{ disableUnderline: false }}
                          sx={{
                            "& .MuiInput-underline:before": { borderColor: "rgba(255,255,255,0.08)" },
                          }}
                        />
                      </Stack>
                    );
                  })}
                </Box>
              ))}
          </Box>
        </Stack>

        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {error && (
            <Typography color="error" variant="body2" sx={{ flex: 1 }}>
              {error}
            </Typography>
          )}
          {saving && <LinearProgress color="secondary" sx={{ flex: 1 }} />}
          <Box sx={{ flex: error || saving ? 0 : 1 }} />
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="secondary" disabled={saving}>
            Save
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
