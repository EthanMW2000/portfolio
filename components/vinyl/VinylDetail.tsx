/* eslint-disable @next/next/no-img-element */
"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AlbumIcon from "@mui/icons-material/Album";
import Link from "next/link";
import type { VinylRecordWithTracks } from "@/types";

interface VinylDetailProps {
  record: VinylRecordWithTracks;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function VinylDetail({ record }: VinylDetailProps) {
  const hasMultipleDiscs = record.tracks.some((t) => t.discNumber > 1);

  return (
    <>
      <Button
        component={Link}
        href="/vinyl"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.secondary" }}
      >
        Back to Collection
      </Button>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          mb: 4,
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: 300 },
            flexShrink: 0,
          }}
        >
          {record.coverUrl ? (
            <img
              src={record.coverUrl}
              alt={`${record.title} by ${record.artist}`}
              style={{
                width: "100%",
                borderRadius: 8,
                display: "block",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                paddingTop: "100%",
                position: "relative",
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlbumIcon sx={{ fontSize: 80, color: "text.secondary" }} />
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="h3" color="text.primary" sx={{ fontWeight: 700 }}>
            {record.title}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            {record.artist}
          </Typography>
          <Stack direction="row" spacing={1}>
            {record.year && <Chip label={record.year} variant="outlined" />}
            <Chip
              label={`${record.trackCount} tracks`}
              variant="outlined"
            />
          </Stack>
        </Box>
      </Box>

      {record.tracks.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right" sx={{ width: 80 }}>
                  Duration
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {record.tracks.map((track) => (
                <TableRow key={track.id} hover>
                  <TableCell>
                    {hasMultipleDiscs
                      ? `${track.discNumber}.${track.trackNumber}`
                      : track.trackNumber}
                  </TableCell>
                  <TableCell>{track.title}</TableCell>
                  <TableCell align="right">
                    {formatDuration(track.duration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
