"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Alert,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import YouTubeIcon from "@mui/icons-material/YouTube";
import type { VinylRecordWithTracks, VinylTrack } from "@/types";

interface TrackUploadState {
  file: File | null;
  youtubeUrl: string;
  status: "idle" | "uploading" | "fetching" | "done" | "error";
  progress: number;
  error?: string;
}

interface FingerprintUploadProps {
  record: VinylRecordWithTracks;
}

export default function FingerprintUpload({ record }: FingerprintUploadProps) {
  const [trackStates, setTrackStates] = useState<
    Record<string, TrackUploadState>
  >(() => {
    const initial: Record<string, TrackUploadState> = {};
    for (const track of record.tracks) {
      initial[track.id] = {
        file: null,
        youtubeUrl: "",
        status: "idle",
        progress: 0,
      };
    }
    return initial;
  });
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(trackId: string, file: File) {
    setTrackStates((prev) => ({
      ...prev,
      [trackId]: { ...prev[trackId], file, status: "idle", progress: 0 },
    }));
  }

  function handleYoutubeUrlChange(trackId: string, url: string) {
    setTrackStates((prev) => ({
      ...prev,
      [trackId]: { ...prev[trackId], youtubeUrl: url },
    }));
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
        xhr.setRequestHeader("Content-Type", state.file!.type || "audio/wav");

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

  async function fetchFromYoutube(track: VinylTrack) {
    const state = trackStates[track.id];
    if (!state?.youtubeUrl) return;

    setTrackStates((prev) => ({
      ...prev,
      [track.id]: { ...prev[track.id], status: "fetching", progress: 0 },
    }));

    try {
      const res = await fetch("/api/vinyl/fingerprint/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          youtubeUrl: state.youtubeUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }

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
          error: err instanceof Error ? err.message : "Fetch failed",
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

  async function fetchAll() {
    setError(null);
    const tracksWithUrls = record.tracks.filter(
      (t) =>
        trackStates[t.id]?.youtubeUrl && trackStates[t.id]?.status !== "done",
    );

    if (tracksWithUrls.length === 0) {
      setError("No YouTube URLs entered");
      return;
    }

    for (const track of tracksWithUrls) {
      await fetchFromYoutube(track);
    }
  }

  const anyBusy = Object.values(trackStates).some(
    (s) => s.status === "uploading" || s.status === "fetching",
  );
  const anyFileReady = Object.values(trackStates).some(
    (s) => s.file && s.status !== "done",
  );
  const anyUrlReady = Object.values(trackStates).some(
    (s) => s.youtubeUrl && s.status !== "done",
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: { xs: 2, sm: 4 },
        pt: { xs: 4, sm: 8 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
          <IconButton href="/admin/vinyl" color="secondary">
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            color="text.primary"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Fingerprint Audio
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {record.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {record.artist}
            {record.year ? ` (${record.year})` : ""}
          </Typography>

          <Table size="small" sx={{ mt: 2 }}>
            <TableBody>
              {record.tracks.map((track) => {
                const state = trackStates[track.id];
                const isBusy =
                  state?.status === "uploading" ||
                  state?.status === "fetching";
                return (
                  <TableRow key={track.id}>
                    <TableCell sx={{ width: 30, px: 0.5, verticalAlign: "top", pt: 2 }}>
                      {track.trackNumber}
                    </TableCell>
                    <TableCell sx={{ px: 0.5, verticalAlign: "top", pt: 2 }}>
                      <Typography variant="body2">{track.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {state?.status === "done" && (
                            <CheckCircleIcon
                              color="success"
                              fontSize="small"
                            />
                          )}
                          {state?.status === "error" && (
                            <ErrorIcon color="error" fontSize="small" />
                          )}

                          {state?.status === "uploading" && (
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={state.progress}
                                color="secondary"
                              />
                            </Box>
                          )}

                          {state?.status === "fetching" && (
                            <CircularProgress size={20} color="secondary" />
                          )}

                          {state?.file && !isBusy && (
                            <Chip
                              label={state.file.name}
                              size="small"
                              variant="outlined"
                              color={
                                state.status === "done"
                                  ? "success"
                                  : state.status === "error"
                                    ? "error"
                                    : "default"
                              }
                            />
                          )}

                          {!isBusy && (
                            <Button
                              component="label"
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<UploadFileIcon />}
                            >
                              {state?.file ? "Replace" : "File"}
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

                        {state?.status !== "done" && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              size="small"
                              placeholder="YouTube URL"
                              value={state?.youtubeUrl ?? ""}
                              onChange={(e) =>
                                handleYoutubeUrlChange(track.id, e.target.value)
                              }
                              disabled={isBusy}
                              sx={{ flex: 1, minWidth: 180 }}
                              slotProps={{
                                input: { sx: { fontSize: "0.8rem" } },
                              }}
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<YouTubeIcon />}
                              disabled={!state?.youtubeUrl || isBusy}
                              onClick={() => fetchFromYoutube(track)}
                            >
                              Fetch
                            </Button>
                          </Stack>
                        )}

                        {state?.status === "error" && state.error && (
                          <Typography variant="caption" color="error">
                            {state.error}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={uploadAll}
            disabled={anyBusy || !anyFileReady}
            startIcon={<UploadFileIcon />}
          >
            {anyBusy ? "Processing..." : "Upload All"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={fetchAll}
            disabled={anyBusy || !anyUrlReady}
            startIcon={<YouTubeIcon />}
          >
            {anyBusy ? "Processing..." : "Fetch All"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
