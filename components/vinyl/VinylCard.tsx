/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AlbumIcon from "@mui/icons-material/Album";
import type { VinylRecord } from "@/types";

interface VinylCardProps {
  record: VinylRecord;
}

export default function VinylCard({ record }: VinylCardProps) {
  return (
    <Card sx={{ bgcolor: "background.default" }}>
      <CardActionArea component={Link} href={`/vinyl/${record.id}`}>
        <Box
          sx={{
            position: "relative",
            paddingTop: "100%",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {record.coverUrl ? (
            <img
              src={record.coverUrl}
              alt={`${record.title} by ${record.artist}`}
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
          ) : (
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
              <AlbumIcon sx={{ fontSize: 64, color: "text.secondary" }} />
            </Box>
          )}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(transparent, rgba(0,0,0,0.85))",
              p: 1.5,
              pt: 4,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#fff", lineHeight: 1.3 }}
              noWrap
            >
              {record.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)" }}
              noWrap
            >
              {record.artist}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
