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
  IconButton,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AlbumIcon from "@mui/icons-material/Album";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import type { VinylRecord } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (record: VinylRecord) => void;
}

interface TrackRow {
  key: number;
  discNumber: number;
  trackNumber: number;
  title: string;
}

let nextKey = 1;

export default function VinylAddModal({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [tracks, setTracks] = useState<TrackRow[]>([
    { key: nextKey++, discNumber: 1, trackNumber: 1, title: "" },
  ]);
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

  function addTrack() {
    const lastTrack = tracks[tracks.length - 1];
    setTracks((prev) => [
      ...prev,
      {
        key: nextKey++,
        discNumber: lastTrack?.discNumber ?? 1,
        trackNumber: (lastTrack?.trackNumber ?? 0) + 1,
        title: "",
      },
    ]);
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTrack(index: number, field: keyof TrackRow, value: string | number) {
    setTracks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    if (!title.trim() || !artist.trim() || tracks.length === 0) {
      setError("Title, artist, and at least one track are required");
      return;
    }

    const emptyTracks = tracks.some((t) => !t.title.trim());
    if (emptyTracks) {
      setError("All tracks must have a title");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/vinyl/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          year: year ? parseInt(year, 10) : null,
          tracks: tracks.map((t) => ({
            title: t.title.trim(),
            trackNumber: t.trackNumber,
            discNumber: t.discNumber,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create record");
      const { record } = await res.json();

      if (coverFile) {
        const presignRes = await fetch("/api/vinyl/cover/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recordId: record.id, contentType: coverFile.type }),
        });

        if (presignRes.ok) {
          const { uploadUrl, key, coverUrl } = await presignRes.json();
          await fetch(uploadUrl, {
            method: "PUT",
            body: coverFile,
            headers: { "Content-Type": coverFile.type },
          });

          const patchRes = await fetch(`/api/vinyl/${record.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coverKey: key, coverUrl }),
          });

          if (patchRes.ok) {
            const updated = await patchRes.json();
            onSaved(updated);
            return;
          }
        }
      }

      onSaved(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add Custom Record
        </Typography>

        {saving && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 8 }}
              />
            ) : (
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlbumIcon sx={{ fontSize: 64, color: "text.secondary" }} />
              </Box>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleCoverSelect} />
            <Button
              size="small"
              startIcon={<PhotoCameraIcon />}
              onClick={() => fileInputRef.current?.click()}
              color="secondary"
            >
              {coverFile ? "Change Cover" : "Add Cover"}
            </Button>

            <Stack spacing={2} sx={{ width: "100%", mt: 1 }}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                size="small"
                fullWidth
                required
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

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Tracks</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addTrack} color="secondary">
                Add Track
              </Button>
            </Stack>

            <Stack spacing={1}>
              {tracks.map((track, i) => (
                <Stack key={track.key} direction="row" spacing={1} alignItems="center">
                  <TextField
                    value={track.discNumber}
                    onChange={(e) => updateTrack(i, "discNumber", parseInt(e.target.value, 10) || 1)}
                    size="small"
                    sx={{ width: 55 }}
                    inputProps={{ inputMode: "numeric" }}
                    placeholder="Disc"
                  />
                  <TextField
                    value={track.trackNumber}
                    onChange={(e) => updateTrack(i, "trackNumber", parseInt(e.target.value, 10) || 1)}
                    size="small"
                    sx={{ width: 55 }}
                    inputProps={{ inputMode: "numeric" }}
                    placeholder="#"
                  />
                  <TextField
                    value={track.title}
                    onChange={(e) => updateTrack(i, "title", e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Track title"
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeTrack(i)}
                    disabled={tracks.length <= 1}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 3 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="secondary" disabled={saving}>
            Save Record
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
