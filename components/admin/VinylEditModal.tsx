"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from "@mui/material";
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

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function updateTrack(index: number, field: keyof TrackEdit, value: string | number) {
    setTracks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
        albumFields.coverUrl = `${coverUrl}?v=${Date.now()}`;
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Album</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {displayCover ? (
              <img
                src={displayCover}
                alt={title}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PhotoCameraIcon color="disabled" />
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverSelect}
            />
            <IconButton onClick={() => fileInputRef.current?.click()} color="secondary">
              <PhotoCameraIcon />
            </IconButton>
          </Box>

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
            onChange={(e) => setYear(e.target.value)}
            size="small"
            type="number"
            fullWidth
          />

          <Typography variant="subtitle2" sx={{ pt: 1 }}>
            Tracks
          </Typography>
          {tracks.map((track, i) => {
            const original = record.tracks[i];
            const showDisc = record.tracks.some((t) => t.discNumber > 1);
            return (
              <Stack key={track.id} direction="row" spacing={1} alignItems="center">
                {showDisc && (
                  <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                    {original?.discNumber}.
                  </Typography>
                )}
                <TextField
                  value={track.trackNumber}
                  onChange={(e) => updateTrack(i, "trackNumber", parseInt(e.target.value, 10) || 0)}
                  size="small"
                  type="number"
                  sx={{ width: 70 }}
                />
                <TextField
                  value={track.title}
                  onChange={(e) => updateTrack(i, "title", e.target.value)}
                  size="small"
                  fullWidth
                />
              </Stack>
            );
          })}
        </Stack>

        {saving && <LinearProgress color="secondary" sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="secondary" disabled={saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
