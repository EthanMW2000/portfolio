import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import AlbumIcon from "@mui/icons-material/Album";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonIcon from "@mui/icons-material/Person";
import { getAllRecords, getCollectionStats } from "@/lib/vinyl";
import VinylCard from "@/components/vinyl/VinylCard";

export default async function VinylPage() {
  const [records, stats] = await Promise.all([
    getAllRecords(),
    getCollectionStats(),
  ]);

  return (
    <>
      <Typography
        variant="h3"
        color="text.primary"
        sx={{ mb: 1, fontWeight: 700 }}
      >
        Vinyl Collection
      </Typography>

      {stats.totalRecords > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          <Chip
            icon={<AlbumIcon />}
            label={`${stats.totalRecords} records`}
            variant="outlined"
          />
          <Chip
            icon={<PersonIcon />}
            label={`${stats.uniqueArtists} artists`}
            variant="outlined"
          />
          <Chip
            icon={<MusicNoteIcon />}
            label={`${stats.totalTracks} tracks`}
            variant="outlined"
          />
        </Stack>
      )}

      {records.length === 0 ? (
        <Typography color="text.secondary">No records yet.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {records.map((record) => (
            <VinylCard key={record.id} record={record} />
          ))}
        </Box>
      )}
    </>
  );
}
