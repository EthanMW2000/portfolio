"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
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
import EditIcon from "@mui/icons-material/Edit";
import AlbumIcon from "@mui/icons-material/Album";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { VinylRecord, VinylRecordWithTracks } from "@/types";
import VinylEditModal from "./VinylEditModal";
import VinylAddModal from "./VinylAddModal";
import type { MBRelease, MBTrack } from "@/lib/musicbrainz";

interface ImportResult {
  record: VinylRecord;
  tracksImported: number;
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
  const [artistQuery, setArtistQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MBRelease[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [records, setRecords] = useState<VinylRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<Record<string, ReleasePreview>>({});
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());
  const [editingRecord, setEditingRecord] = useState<VinylRecordWithTracks | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");

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
    if (!query.trim() && !artistQuery.trim()) return;
    setSearching(true);
    setResults([]);
    setImportResult(null);
    setExpandedIds(new Set());
    setPreviews({});
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query);
      if (artistQuery.trim()) params.set("artist", artistQuery);
      const res = await fetch(`/api/vinyl/search?${params}`);
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
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(releaseId)) {
        next.delete(releaseId);
      } else {
        next.add(releaseId);
      }
      return next;
    });

    if (previews[releaseId]) return;

    setLoadingPreviews((prev) => new Set(prev).add(releaseId));
    try {
      const res = await fetch(
        `/api/vinyl/preview?id=${encodeURIComponent(releaseId)}`
      );
      if (!res.ok) throw new Error("Preview failed");
      const data = await res.json();
      setPreviews((prev) => ({ ...prev, [releaseId]: data }));
    } catch {
      setError("Failed to load release details");
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(releaseId);
        return next;
      });
    } finally {
      setLoadingPreviews((prev) => {
        const next = new Set(prev);
        next.delete(releaseId);
        return next;
      });
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
      setExpandedIds(new Set());
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

  async function handleEdit(id: string) {
    try {
      const res = await fetch(`/api/vinyl/${id}`);
      if (!res.ok) throw new Error("Failed to fetch record");
      const data: VinylRecordWithTracks = await res.json();
      setEditingRecord(data);
    } catch {
      setError("Failed to load record for editing");
    }
  }

  function handleEditSaved(updated: VinylRecordWithTracks) {
    setRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
    setEditingRecord(null);
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
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<AlbumIcon />}
              onClick={() => setShowAddModal(true)}
              variant="contained"
              color="secondary"
              size="small"
            >
              Add Custom
            </Button>
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
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ p: 3, mb: 3, border: 1, borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
          <Typography variant="h6" gutterBottom>
            Import from MusicBrainz
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Album title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="Artist..."
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleSearch}
              disabled={searching || (!query.trim() && !artistQuery.trim())}
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
                const isExpanded = expandedIds.has(release.id);

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
                        {loadingPreviews.has(release.id) && (
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
                              {(() => {
                                const discs = new Map<number, typeof preview.tracks>();
                                for (const track of preview.tracks) {
                                  const list = discs.get(track.discNumber) ?? [];
                                  list.push(track);
                                  discs.set(track.discNumber, list);
                                }
                                const multiDisc = discs.size > 1;

                                return Array.from(discs.entries()).map(([discNum, discTracks]) => (
                                  <Box key={discNum}>
                                    {multiDisc && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: "block", mt: discNum > 1 ? 1.5 : 0, mb: 0.5 }}
                                      >
                                        Disc {discNum}
                                      </Typography>
                                    )}
                                    <Table size="small">
                                      <TableBody>
                                        {discTracks.map((track) => (
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
                                ));
                              })()}
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
            </Alert>
          )}
        </Box>

        <Box sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">
              Collection ({records.length} records)
            </Typography>
          </Stack>

          {records.length > 0 && (
            <TextField
              fullWidth
              size="small"
              placeholder="Filter by title or artist..."
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
              sx={{ mb: 1 }}
            />
          )}

          {loading && <LinearProgress color="secondary" />}

          {!loading && records.length === 0 && (
            <Typography color="text.secondary">
              No records yet. Search and import above.
            </Typography>
          )}

          {records.length > 0 && (() => {
            const q = collectionFilter.toLowerCase();
            const filtered = q
              ? records.filter((r) => r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q))
              : records;

            if (filtered.length === 0) {
              return (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No records match &ldquo;{collectionFilter}&rdquo;
                </Typography>
              );
            }

            return (
              <List>
                {filtered.map((record, i) => (
                  <Box key={record.id}>
                    {i > 0 && <Divider />}
                    <ListItem>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: "hidden",
                          bgcolor: "background.default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {record.coverUrl ? (
                          <img
                            src={record.coverUrl}
                            alt=""
                            style={{ width: 48, height: 48, objectFit: "cover" }}
                          />
                        ) : (
                          <AlbumIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                        )}
                      </Box>
                      <ListItemText
                        primary={record.title}
                        secondary={`${record.artist}${record.year ? ` (${record.year})` : ""} — ${record.trackCount} tracks${record.audioComplete ? " ✓ audio" : ""}${!record.coverUrl ? " — no cover" : ""}`}
                      />
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          onClick={() => handleEdit(record.id)}
                          color="secondary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          href={`/admin/vinyl/${record.id}/fingerprint`}
                          color="secondary"
                          size="small"
                        >
                          <FingerprintIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(record.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  </Box>
                ))}
              </List>
            );
          })()}
        </Box>

        {editingRecord && (
          <VinylEditModal
            record={editingRecord}
            open={true}
            onClose={() => setEditingRecord(null)}
            onSaved={handleEditSaved}
          />
        )}

        <VinylAddModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSaved={(record) => {
            setRecords((prev) => [record, ...prev]);
            setShowAddModal(false);
          }}
        />
      </Box>
    </Box>
  );
}
