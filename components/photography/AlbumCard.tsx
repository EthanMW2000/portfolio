/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { Album } from "@/types";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Card>
      <CardActionArea component={Link} href={`/photography/${album.slug}`}>
        <Box
          sx={{
            position: "relative",
            paddingTop: "66%",
            bgcolor: "grey.800",
            overflow: "hidden",
          }}
        >
          {album.coverPhoto && (
            <img
              src={album.coverPhoto.thumbnailUrl}
              alt={album.name}
              loading="lazy"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </Box>
        <CardContent>
          <Typography variant="h6">{album.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
