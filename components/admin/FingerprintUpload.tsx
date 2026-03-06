"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import type { VinylRecordWithTracks, VinylTrack } from "@/types";

interface TrackUploadState {
  file: File | null;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

interface FingerprintUploadProps {
  record: VinylRecordWithTracks;
}

function extractDiscAndTrack(file: File): { disc: number | null; track: number | null } {
  const path = file.webkitRelativePath || file.name;

  const discFromPath = path.match(/(?:dis[ck]|cd)\s*(\d+)/i);
  const disc = discFromPath ? parseInt(discFromPath[1], 10) : null;

  const basename = path.split("/").pop() ?? "";

  const discTrackPrefix = basename.match(/^(\d+)-(\d+)/);
  if (discTrackPrefix) {
    return {
      disc: disc ?? parseInt(discTrackPrefix[1], 10),
      track: parseInt(discTrackPrefix[2], 10),
    };
  }

  const trackMatch = basename.match(/^(\d+)/);
  return {
    disc,
    track: trackMatch ? parseInt(trackMatch[1], 10) : null,
  };
}

export default function FingerprintUpload({ record }: FingerprintUploadProps) {
  const [trackStates, setTrackStates] = useState<
    Record<string, TrackUploadState>
  >(() => {
    const initial: Record<string, TrackUploadState> = {};
    for (const track of record.tracks) {
      initial[track.id] = { file: null, status: "idle", progress: 0 };
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileSelect(trackId: string, file: File) {
    setTrackStates((prev) => ({
      ...prev,
      [trackId]: { ...prev[trackId], file, status: "idle", progress: 0 },
    }));
  }

  const hasMultipleDiscs = record.tracks.some((t) => t.discNumber > 1);

  const matchFilesToTracks = useCallback(
    (files: File[]) => {
      const sorted = [...files].sort((a, b) =>
        (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name),
      );
      let matched = 0;

      setTrackStates((prev) => {
        const next = { ...prev };
        const matchedTrackIds = new Set<string>();

        for (const file of sorted) {
          const { disc, track: trackNum } = extractDiscAndTrack(file);
          if (trackNum === null) continue;

          let track;
          if (hasMultipleDiscs && disc !== null) {
            track = record.tracks.find((t) =>
              !matchedTrackIds.has(t.id) && t.trackNumber === trackNum && t.discNumber === disc,
            );
          } else if (hasMultipleDiscs) {
            track = record.tracks[trackNum - 1] ?? null;
            if (track && matchedTrackIds.has(track.id)) track = null;
          } else {
            track = record.tracks.find((t) =>
              !matchedTrackIds.has(t.id) && t.trackNumber === trackNum,
            );
          }
          if (!track) continue;

          matchedTrackIds.add(track.id);
          next[track.id] = { ...next[track.id], file, status: "idle", progress: 0 };
          matched++;
        }

        if (matched === 0) {
          for (let i = 0; i < sorted.length && i < record.tracks.length; i++) {
            const track = record.tracks[i];
            next[track.id] = {
              ...next[track.id],
              file: sorted[i],
              status: "idle",
              progress: 0,
            };
            matched++;
          }
        }

        return next;
      });

      return matched;
    },
    [record.tracks, hasMultipleDiscs],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(f.name),
    );

    if (files.length === 0) {
      setError("No audio files found");
      return;
    }

    const matched = matchFilesToTracks(files);
    if (matched === 0) {
      setError("Could not match any files to tracks");
    }
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(f.name),
    );
    e.target.value = "";

    if (files.length === 0) {
      setError("No audio files found");
      return;
    }

    const matched = matchFilesToTracks(files);
    if (matched === 0) {
      setError("Could not match any files to tracks");
    }
  }

  async function uploadTrack(track: VinylTrack) {
    const state = trackStates[track.id];
    if (!state?.file) return;

    setTrackStates((prev) => ({
      ...prev,
      [track.id]: { ...prev[track.id], status: "uploading", progress: 0 },
    }));

    try {
      const presignRes = await fetch("/api/vinyl/fingerprint/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          contentType: state.file.type || "audio/mpeg",
          extension: state.file.name.split(".").pop() || "mp3",
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", state.file!.type || "audio/mpeg");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setTrackStates((prev) => ({
              ...prev,
              [track.id]: { ...prev[track.id], progress },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(state.file);
      });

      await fetch("/api/vinyl/fingerprint/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id, recordId: record.id }),
      });

      setTrackStates((prev) => ({
        ...prev,
        [track.id]: { ...prev[track.id], status: "done", progress: 100 },
      }));
    } catch (err) {
      setTrackStates((prev) => ({
        ...prev,
        [track.id]: {
          ...prev[track.id],
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        },
      }));
    }
  }

  async function uploadAll() {
    setError(null);
    const tracksWithFiles = record.tracks.filter(
      (t) => trackStates[t.id]?.file && trackStates[t.id]?.status !== "done",
    );

    if (tracksWithFiles.length === 0) {
      setError("No files selected");
      return;
    }

    for (const track of tracksWithFiles) {
      await uploadTrack(track);
    }
  }

  const anyUploading = Object.values(trackStates).some(
    (s) => s.status === "uploading",
  );
  const anyReady = Object.values(trackStates).some(
    (s) => s.file && s.status !== "done",
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: { xs: 1, sm: 4 },
        pt: { xs: 4, sm: 8 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <IconButton href="/admin/vinyl" color="secondary">
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            color="text.primary"
            sx={{ fontSize: { xs: "1.3rem", sm: "2rem" } }}
          >
            Upload Audio
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper
          sx={{
            p: { xs: 1.5, sm: 3 },
            mb: 3,
            border: dragOver ? 2 : 0,
            borderColor: "secondary.main",
            borderStyle: "dashed",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Typography variant="h6" gutterBottom>
            {record.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {record.artist}
            {record.year ? ` (${record.year})` : ""}
            {" — "}
            {record.tracks.filter((t) => t.audioUploaded).length}/{record.tracks.length} tracks uploaded
          </Typography>

          <Button
            component="label"
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<FolderOpenIcon />}
            sx={{ mt: 1, mb: 2 }}
          >
            Select Folder
            <input
              type="file"
              hidden
              multiple
              accept="audio/*"
              onChange={handleFolderSelect}
              {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            or drag & drop audio files here
          </Typography>

          <Box sx={{ mt: 1 }}>
            {record.tracks.map((track) => {
              const state = trackStates[track.id];
              const alreadyUploaded = !!track.audioUploaded;
              return (
                <Stack
                  key={track.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    py: 0.75,
                    borderBottom: 1,
                    borderColor: "divider",
                    "&:last-child": { borderBottom: 0 },
                    opacity: alreadyUploaded && state?.status === "idle" && !state?.file ? 0.6 : 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 32, textAlign: "right", flexShrink: 0 }}
                  >
                    {hasMultipleDiscs
                      ? `${track.discNumber}.${track.trackNumber}`
                      : track.trackNumber}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.title}
                  </Typography>

                  {state?.status === "uploading" ? (
                    <Box sx={{ width: 120, flexShrink: 0 }}>
                      <LinearProgress
                        variant="determinate"
                        value={state.progress}
                        color="secondary"
                      />
                    </Box>
                  ) : state?.status === "done" || (alreadyUploaded && state?.status === "idle" && !state?.file) ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : state?.status === "error" ? (
                    <ErrorIcon color="error" fontSize="small" />
                  ) : null}

                  {state?.file && state.status !== "uploading" && (
                    <Chip
                      label={state.file.name}
                      size="small"
                      variant="outlined"
                      sx={{
                        maxWidth: { xs: 100, sm: 200 },
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                      color={
                        state.status === "done"
                          ? "success"
                          : state.status === "error"
                            ? "error"
                            : "default"
                      }
                    />
                  )}

                  {state?.status !== "uploading" && (
                    <Button
                      component="label"
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ flexShrink: 0, minWidth: 0, px: 1 }}
                      startIcon={<UploadFileIcon />}
                    >
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        {state?.file ? "Replace" : "Select"}
                      </Box>
                      <input
                        type="file"
                        hidden
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileSelect(track.id, file);
                          e.target.value = "";
                        }}
                      />
                    </Button>
                  )}
                </Stack>
              );
            })}
          </Box>
        </Paper>

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          onClick={uploadAll}
          disabled={anyUploading || !anyReady}
          startIcon={<UploadFileIcon />}
        >
          {anyUploading ? "Uploading..." : "Upload All"}
        </Button>
      </Box>
    </Box>
  );
}
