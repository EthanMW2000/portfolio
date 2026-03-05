import type { ReactNode } from "react";
import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Sidebar from "@/components/photography/Sidebar";
import { getAlbums } from "@/lib/photography";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photography | Ethan Wells",
  description: "Photography portfolio by Ethan Wells",
};

export default async function PhotographyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const albums = await getAlbums();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar albums={albums} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: "240px" },
          p: { xs: 2, sm: 3 },
          pt: { xs: 8, md: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
