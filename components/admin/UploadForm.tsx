"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Autocomplete,
  TextField,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";

type FileStatus = "pending" | "uploading" | "done" | "error";

interface QueuedFile {
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

function sanitizeAlbum(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const chipColor = (status: FileStatus) => {
  if (status === "done") return "success";
  if (status === "error") return "error";
  if (status === "uploading") return "secondary";
  return "default";
};

export default function UploadForm({ albums }: { albums: string[] }) {
  const [album, setAlbum] = useState<string | null>(null);
  const [albumInput, setAlbumInput] = useState("");
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(files).map((file) => ({
      file,
      status: "pending",
      progress: 0,
    }));
    setQueue((q) => [...q, ...newItems]);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
    },
    [addFiles]
  );

  const updateFile = (index: number, patch: Partial<QueuedFile>) => {
    setQueue((q) => q.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const uploadFile = async (item: QueuedFile, index: number, targetAlbum: string) => {
    updateFile(index, { status: "uploading", progress: 0 });

    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          album: targetAlbum,
          filename: item.file.name,
          contentType: item.file.type,
        }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl } = await presignRes.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: item.file,
        headers: { "Content-Type": item.file.type },
      });

      updateFile(index, { status: "done", progress: 100 });
    } catch (err) {
      updateFile(index, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const handleUpload = async () => {
    if (!album || queue.length === 0) return;
    setUploading(true);

    const pending = queue
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.status === "pending");

    await Promise.all(pending.map(({ item, index }) => uploadFile(item, index, album)));
    setUploading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const pendingCount = queue.filter((f) => f.status === "pending").length;
  const canUpload = !!album && pendingCount > 0 && !uploading;

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
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h3" color="text.primary">Upload Photos</Typography>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Logout
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Autocomplete
              options={albums}
              value={album}
              inputValue={albumInput}
              onChange={(_, val) => setAlbum(val ? sanitizeAlbum(val) : null)}
              onInputChange={(_, val) => setAlbumInput(val)}
              onBlur={() => {
                const sanitized = sanitizeAlbum(albumInput);
                if (sanitized) {
                  setAlbum(sanitized);
                  setAlbumInput(sanitized);
                }
              }}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Album" placeholder="Select or create album" />
              )}
            />

            <Box
              onDrop={onDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: dragging ? "secondary.main" : "divider",
                borderRadius: 2,
                p: 5,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: dragging ? "action.selected" : "transparent",
                transition: "border-color 0.15s, background-color 0.15s",
                "&:hover": {
                  borderColor: "secondary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
              <Typography variant="body1" color="text.primary">
                Drag and drop images here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onFileChange}
              />
            </Box>

            {queue.length > 0 && (
              <>
                <Divider />
                <List disablePadding>
                  {queue.map((item, i) => (
                    <ListItem
                      key={i}
                      disableGutters
                      sx={{ flexDirection: "column", alignItems: "flex-start", py: 0.75 }}
                    >
                      <Stack
                        direction="row"
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {item.file.name}
                            </Typography>
                          }
                          sx={{ minWidth: 0 }}
                        />
                        <Chip
                          label={item.status}
                          size="small"
                          color={chipColor(item.status)}
                          variant={item.status === "pending" ? "outlined" : "filled"}
                          sx={{ flexShrink: 0 }}
                        />
                      </Stack>
                      {item.status === "uploading" && (
                        <LinearProgress
                          color="secondary"
                          sx={{ width: "100%", mt: 0.5, borderRadius: 1 }}
                        />
                      )}
                      {item.status === "error" && (
                        <Typography variant="caption" color="error.main">
                          {item.error}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpload}
                disabled={!canUpload}
                startIcon={<CloudUploadIcon />}
              >
                Upload{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </Button>
              {queue.length > 0 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setQueue([])}
                  disabled={uploading}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
