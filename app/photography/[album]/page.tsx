import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import MasonryGrid from "@/components/photography/MasonryGrid";
import { getAlbumPhotos } from "@/lib/photography";

interface AlbumPageProps {
  params: Promise<{ album: string }>;
}

function formatAlbumName(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { album } = await params;
  const photos = await getAlbumPhotos(album);

  if (photos.length === 0) {
    notFound();
  }

  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>
        {formatAlbumName(album)}
      </Typography>
      <MasonryGrid photos={photos} />
    </>
  );
}
