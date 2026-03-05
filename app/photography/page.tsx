import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AlbumCard from "@/components/photography/AlbumCard";
import { getAlbums } from "@/lib/photography";

export default async function PhotographyPage() {
  const albums = await getAlbums();

  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Photography
      </Typography>
      {albums.length === 0 ? (
        <Typography color="text.secondary">No albums yet.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {albums.map((album) => (
            <AlbumCard key={album.slug} album={album} />
          ))}
        </Box>
      )}
    </>
  );
}
