"use client";

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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AlbumIcon from "@mui/icons-material/Album";
import LogoutIcon from "@mui/icons-material/Logout";
import type { VinylRecord } from "@/types";
import type { MBRelease } from "@/lib/musicbrainz";

interface ImportResult {
  record: VinylRecord;
  tracksImported: number;
  fingerprintsFound: number;
  fingerprintsBackfilling: number;
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
          <Typography variant="h3" color="text.primary" sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}>
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
              {results.map((release) => (
                <ListItem
                  key={release.id}
                  divider
                  sx={{ flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 1 }}
                >
                  <ListItemText
                    primary={release.title}
                    secondary={`${release.artist}${release.year ? ` (${release.year})` : ""} — ${release.trackCount} tracks`}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleImport(release)}
                    disabled={importing !== null}
                    startIcon={<AlbumIcon />}
                    sx={{ flexShrink: 0 }}
                  >
                    {importing === release.id ? "Importing..." : "Import"}
                  </Button>
                </ListItem>
              ))}
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
