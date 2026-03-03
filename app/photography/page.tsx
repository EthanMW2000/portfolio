import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ImageContainer } from "@/components/photography/ImageContainer";
import Sidebar from "@/components/photography/Sidebar";
import { S3Object } from "@/types";

export default async function Photography() {
  const retrieveImages = async () => {
    const imagesUrls: S3Object[] = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/photography`,
      { next: { revalidate: 3600 } }
    )
      .then((res) =>
        res
          .json()
          .then((data: any[]) =>
            data.map((d) => new S3Object(d.url, d.metadata))
          )
      )
      .catch((err) => {
        console.error(err);
        return [];
      });

    imagesUrls.sort((a, b) => {
      if (!a.metadata?.DateTimeOriginal || !b.metadata?.DateTimeOriginal)
        return 0;
      return (
        Number(new Date(b.metadata.DateTimeOriginal)) -
        Number(new Date(a.metadata.DateTimeOriginal))
      );
    });

    return imagesUrls;
  };

  const imagesUrls = await retrieveImages();

  return (
    <Box component="main">
      <Sidebar />
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 10,
          pb: 6,
        }}
      >
        <Typography variant="h3" sx={{ mb: 2, textAlign: "center" }}>
          My photography showcase is currently being built!
        </Typography>
        <Typography variant="body1" sx={{ color: "secondary.main", mb: 4 }}>
          Check back soon
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          href="/"
          endIcon={<ArrowForwardIcon />}
          size="large"
          sx={{ mb: 6 }}
        >
          Home
        </Button>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
          {imagesUrls.map((image, index) => (
            <ImageContainer key={`${index}-${image.url}`} s3Object={image} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
