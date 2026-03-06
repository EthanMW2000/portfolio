"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AlbumIcon from "@mui/icons-material/Album";
import PersonIcon from "@mui/icons-material/Person";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import VinylCard from "./VinylCard";
import type { VinylRecord, VinylCollectionStats } from "@/types";

type SortBy = "recent" | "title" | "artist" | "year";

interface Props {
  records: VinylRecord[];
  stats: VinylCollectionStats;
}

export default function VinylCollection({ records, stats }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");

  const filtered = useMemo(() => {
    let list = records;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sortBy) {
      case "recent":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "artist":
        sorted.sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
        break;
      case "year":
        sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
    }

    return sorted;
  }, [records, search, sortBy]);

  return (
    <>
      <Typography variant="h3" color="text.primary" sx={{ mb: 1, fontWeight: 700 }}>
        Vinyl Collection
      </Typography>

      {stats.totalRecords > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip icon={<AlbumIcon />} label={`${stats.totalRecords} records`} variant="outlined" />
          <Chip icon={<PersonIcon />} label={`${stats.uniqueArtists} artists`} variant="outlined" />
          <Chip icon={<MusicNoteIcon />} label={`${stats.totalTracks} tracks`} variant="outlined" />
        </Stack>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        sx={{ mb: 3 }}
      >
        <TextField
          size="small"
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240 }}
        />
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={(_, val) => val && setSortBy(val)}
          size="small"
        >
          <ToggleButton value="recent">Recent</ToggleButton>
          <ToggleButton value="title">A–Z</ToggleButton>
          <ToggleButton value="artist">Artist</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 4 }}>
          {search.trim() ? "No records match your search." : "No records yet."}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {filtered.map((record, i) => {
            const offsets = [0, -8, 4];
            return (
              <Box
                key={record.id}
                sx={{ transform: `translateY(${offsets[i % offsets.length]}px)` }}
              >
                <VinylCard record={record} />
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}
