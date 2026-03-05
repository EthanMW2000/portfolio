/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import type { Photo } from "@/types";

interface MasonryItemProps {
  photo: Photo;
  onClick: () => void;
}

export default function MasonryItem({ photo, onClick }: MasonryItemProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
        bgcolor: "action.hover",
        "&:hover .overlay": { opacity: 1 },
      }}
    >
      <img
        ref={imgRef}
        src={photo.thumbnailUrl}
        alt="Photograph"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      />
      <Box
        className="overlay"
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.15)",
          opacity: 0,
          transition: "opacity 0.2s ease",
        }}
      />
    </Box>
  );
}
