/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import AlbumIcon from "@mui/icons-material/Album";
import type { VinylRecord } from "@/types";

interface VinylCardProps {
  record: VinylRecord;
}

export default function VinylCard({ record }: VinylCardProps) {
  return (
    <Box
      sx={{
        position: "relative",
        "@media (hover: hover)": {
          "&:hover .vinyl-disc": {
            transform: "translateX(30%)",
          },
          "&:hover .vinyl-sleeve": {
            transform: "translateY(-4px) scale(1.01) rotate(1.5deg)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          },
        },
      }}
    >
      <Box
        className="vinyl-disc"
        sx={{
          position: "absolute",
          top: "5%",
          right: "0%",
          width: "85%",
          height: "85%",
          borderRadius: "50%",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translateX(0)",
          zIndex: 0,
          background: `
            radial-gradient(circle, #444 18%, transparent 18.5%),
            radial-gradient(circle, #3a3a3a 19%, transparent 19.5%),
            repeating-radial-gradient(circle at center, transparent 20%, rgba(120,120,120,0.12) 21%, transparent 22%),
            radial-gradient(circle, #2a2a2a 100%)
          `,
          boxShadow: "0 2px 12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "15%",
            height: "15%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            bgcolor: "#ccc",
            border: "2px solid #999",
            boxShadow: "0 0 4px rgba(255,255,255,0.15)",
          },
        }}
      />
      <Card
        className="vinyl-sleeve"
        sx={{
          position: "relative",
          zIndex: 1,
          bgcolor: "background.default",
          border: "none",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        <CardActionArea component={Link} href={`/vinyl/${record.id}`}>
          <Box
            sx={{
              position: "relative",
              paddingTop: "100%",
              bgcolor: "background.paper",
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

            {record.year && (
              <Chip
                label={record.year}
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(8px)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 24,
                }}
              />
            )}

            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.92) 100%)",
                p: 1.5,
                pt: 5,
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
                sx={{ color: "#05a3b0" }}
                noWrap
              >
                {record.artist}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.45)", display: "block", fontSize: "0.65rem" }}
              >
                {record.trackCount} track{record.trackCount !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </Box>
  );
}
