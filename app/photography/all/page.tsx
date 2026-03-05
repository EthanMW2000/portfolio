import Typography from "@mui/material/Typography";
import MasonryGrid from "@/components/photography/MasonryGrid";
import { getAllPhotos } from "@/lib/photography";

export default async function AllPhotosPage() {
  const photos = await getAllPhotos();

  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>
        All Photos
      </Typography>
      <MasonryGrid photos={photos} />
    </>
  );
}
