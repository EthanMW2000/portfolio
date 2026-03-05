/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import MasonryItem from "./MasonryItem";
import Lightbox from "./Lightbox";
import type { Photo } from "@/types";

interface MasonryGridProps {
  photos: Photo[];
}

export default function MasonryGrid({ photos }: MasonryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleOpen = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null
    );
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null
    );
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
        No photos found.
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          columnCount: { xs: 1, sm: 2, md: 3 },
          columnGap: 2,
          "& > *": {
            breakInside: "avoid",
            mb: 2,
          },
        }}
      >
        {photos.map((photo, index) => (
          <MasonryItem
            key={photo.key}
            photo={photo}
            onClick={() => handleOpen(index)}
          />
        ))}
      </Box>

      {selectedIndex !== null && (
        <Lightbox
          photo={photos[selectedIndex]}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={photos.length > 1}
          hasNext={photos.length > 1}
        />
      )}
    </>
  );
}
