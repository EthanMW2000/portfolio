/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExifStrip from "./ExifStrip";
import type { ExifData, Photo } from "@/types";

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function Lightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LightboxProps) {
  const [exif, setExif] = useState<ExifData | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    setExif(null);
    setImageLoaded(false);

    fetch(`/api/photography/exif?url=${encodeURIComponent(photo.webUrl)}`)
      .then((res) => res.json())
      .then(setExif)
      .catch(() => setExif(null));
  }, [photo.webUrl]);

  return (
    <Modal open onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box
        sx={{
          outline: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "95vw",
          maxHeight: "95vh",
        }}
      >
        <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasPrev && (
            <IconButton
              onClick={onPrev}
              sx={{
                position: "absolute",
                left: -56,
                color: "white",
                bgcolor: "rgba(0,0,0,0.4)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                display: { xs: "none", sm: "flex" },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
          )}

          {!imageLoaded && (
            <CircularProgress sx={{ color: "white", position: "absolute" }} />
          )}

          <img
            src={photo.webUrl}
            alt="Photograph"
            onLoad={() => setImageLoaded(true)}
            style={{
              maxHeight: "85vh",
              maxWidth: "90vw",
              objectFit: "contain",
              borderRadius: 8,
              opacity: imageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />

          {hasNext && (
            <IconButton
              onClick={onNext}
              sx={{
                position: "absolute",
                right: -56,
                color: "white",
                bgcolor: "rgba(0,0,0,0.4)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                display: { xs: "none", sm: "flex" },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}

          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.4)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {exif && <ExifStrip exif={exif} />}
      </Box>
    </Modal>
  );
}
