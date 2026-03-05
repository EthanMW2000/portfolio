import type { ReactNode } from "react";
import type { Metadata } from "next";
import Box from "@mui/material/Box";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vinyl Collection | Ethan Wells",
  description: "Vinyl record collection by Ethan Wells",
};

export default function VinylLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        pt: { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200 }}>{children}</Box>
    </Box>
  );
}
