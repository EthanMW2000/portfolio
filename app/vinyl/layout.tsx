import type { ReactNode } from "react";
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import SiteNav from "@/components/SiteNav";

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
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          "@media (prefers-color-scheme: light)": {
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)",
          },
        },
        "&::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        },
      }}
    >
      <SiteNav />
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          pt: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1200 }}>{children}</Box>
      </Box>
    </Box>
  );
}
