"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AlbumIcon from "@mui/icons-material/Album";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { VinylRecord } from "@/types";
import type { MBRelease, MBTrack } from "@/lib/musicbrainz";

interface ImportResult {
  record: VinylRecord;
  tracksImported: number;
  fingerprintsFound: number;
  fingerprintsBackfilling: number;
}

interface ReleasePreview {
  tracks: MBTrack[];
  coverArtUrl: string | null;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function VinylAdmin() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MBRelease[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [records, setRecords] = useState<VinylRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, ReleasePreview>>({});
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, []);

  async function fetchCollection() {
    try {
      const res = await fetch("/api/vinyl");
      if (!res.ok) throw new Error("Failed to fetch collection");
      const data = await res.json();
      setRecords(data.records);
    } catch {
      setError("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setImportResult(null);
    setExpandedId(null);
    setPreviews({});
    setError(null);

    try {
      const res = await fetch(
        `/api/vinyl/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data.releases);
    } catch {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleExpand(releaseId: string) {
    if (expandedId === releaseId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(releaseId);

    if (previews[releaseId]) return;

    setLoadingPreview(releaseId);
    try {
      const res = await fetch(
        `/api/vinyl/preview?id=${encodeURIComponent(releaseId)}`
      );
      if (!res.ok) throw new Error("Preview failed");
      const data = await res.json();
      setPreviews((prev) => ({ ...prev, [releaseId]: data }));
    } catch {
      setError("Failed to load release details");
      setExpandedId(null);
    } finally {
      setLoadingPreview(null);
    }
  }

  async function handleImport(release: MBRelease) {
    setImporting(release.id);
    setImportResult(null);
    setError(null);

    try {
      const res = await fetch("/api/vinyl/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          releaseId: release.id,
          title: release.title,
          artist: release.artist,
          year: release.year,
        }),
      });
      if (!res.ok) throw new Error("Import failed");
      const data = await res.json();
      setImportResult(data);
      setResults([]);
      setQuery("");
      setExpandedId(null);
      setPreviews({});
      await fetchCollection();
    } catch {
      setError("Import failed");
    } finally {
      setImporting(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/vinyl/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Delete failed");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

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
      <Box sx={{ width: "100%", maxWidth: 700 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h3"
            color="text.primary"
            sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}
          >
            Vinyl Collection
          </Typography>
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Import from MusicBrainz
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search for an album..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Stack>

          {searching && <LinearProgress color="secondary" sx={{ mt: 2 }} />}

          {results.length > 0 && (
            <List sx={{ mt: 2 }}>
              {results.map((release) => {
                const preview = previews[release.id];
                const isExpanded = expandedId === release.id;

                return (
                  <Box key={release.id}>
                    <ListItem
                      divider={!isExpanded}
                      sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => handleExpand(release.id)}
                    >
                      <ListItemText
                        primary={release.title}
                        secondary={`${release.artist}${release.year ? ` (${release.year})` : ""} — ${release.trackCount} tracks`}
                      />
                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <IconButton size="small">
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Stack>
                    </ListItem>

                    <Collapse in={isExpanded}>
                      <Box sx={{ px: 2, pb: 2 }}>
                        {loadingPreview === release.id && (
                          <LinearProgress color="secondary" sx={{ mb: 2 }} />
                        )}

                        {preview && (
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ mb: 2 }}
                          >
                            {preview.coverArtUrl && (
                              <Box sx={{ flexShrink: 0 }}>
                                <img
                                  src={preview.coverArtUrl}
                                  alt={release.title}
                                  style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                  }}
                                />
                              </Box>
                            )}
                            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                              <Table size="small">
                                <TableBody>
                                  {preview.tracks.map((track) => (
                                    <TableRow key={`${track.discNumber}-${track.trackNumber}`}>
                                      <TableCell sx={{ width: 30, px: 0.5 }}>
                                        {track.trackNumber}
                                      </TableCell>
                                      <TableCell sx={{ px: 0.5 }}>
                                        <Typography variant="body2" noWrap>
                                          {track.title}
                                        </Typography>
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{ width: 50, px: 0.5 }}
                                      >
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {formatDuration(track.duration)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Stack>
                        )}

                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImport(release);
                          }}
                          disabled={importing !== null}
                          startIcon={<AlbumIcon />}
                          fullWidth
                        >
                          {importing === release.id
                            ? "Importing..."
                            : "Import this album"}
                        </Button>
                      </Box>
                      <Divider />
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          )}

          {importing && (
            <LinearProgress color="secondary" sx={{ mt: 2 }} />
          )}

          {importResult && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Imported &quot;{importResult.record.title}&quot; —{" "}
              {importResult.tracksImported} tracks.
              {importResult.fingerprintsBackfilling > 0 &&
                ` Backfilling ${importResult.fingerprintsBackfilling} fingerprints in background.`}
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Collection ({records.length} records)
          </Typography>

          {loading && <LinearProgress color="secondary" />}

          {!loading && records.length === 0 && (
            <Typography color="text.secondary">
              No records yet. Search and import above.
            </Typography>
          )}

          {records.length > 0 && (
            <List>
              {records.map((record, i) => (
                <Box key={record.id}>
                  {i > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={record.title}
                      secondary={
                        <Stack direction="row" spacing={1} component="span">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {record.artist}
                          </Typography>
                          {record.year && (
                            <Chip
                              label={record.year}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={`${record.trackCount} tracks`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(record.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
