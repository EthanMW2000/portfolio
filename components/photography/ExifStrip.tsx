"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import type { ExifData } from "@/types";

interface ExifStripProps {
  exif: ExifData;
}

export default function ExifStrip({ exif }: ExifStripProps) {
  const chips: { label: string; key: string }[] = [];

  if (exif.camera) chips.push({ label: exif.camera, key: "camera" });
  if (exif.focalLength) chips.push({ label: exif.focalLength, key: "focal" });
  if (exif.aperture) chips.push({ label: exif.aperture, key: "aperture" });
  if (exif.shutterSpeed) chips.push({ label: exif.shutterSpeed, key: "shutter" });
  if (exif.iso) chips.push({ label: `ISO ${exif.iso}`, key: "iso" });

  if (chips.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 2,
        justifyContent: "center",
      }}
    >
      {chips.map(({ label, key }) => (
        <Chip
          key={key}
          icon={key === "camera" ? <CameraAltIcon /> : undefined}
          label={label}
          size="small"
          variant="filled"
          sx={{
            bgcolor: "rgba(0,0,0,0.6)",
            color: "white",
            "& .MuiChip-icon": { color: "white" },
          }}
        />
      ))}
    </Box>
  );
}
