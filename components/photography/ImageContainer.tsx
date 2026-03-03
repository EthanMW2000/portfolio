/* eslint-disable @next/next/no-img-element */

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { S3Object } from "@/types";

export function ImageContainer({ s3Object }: { s3Object: S3Object }) {
  const formattedDate = s3Object.metadata?.DateTimeOriginal
    ? new Date(s3Object.metadata.DateTimeOriginal).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown Date";

  return (
    <Box
      sx={{
        width: 300,
        height: 200,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        bgcolor: "grey.300",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.18)" },
        transition: "box-shadow 0.2s ease",
      }}
    >
      <img
        src={s3Object.url}
        alt="A photograph"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 30,
          bgcolor: "rgba(250,250,250,0.6)",
          px: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 600 }}>
          {formattedDate}
        </Typography>
      </Box>
    </Box>
  );
}
