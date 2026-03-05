"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import CollectionsIcon from "@mui/icons-material/Collections";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import type { Album } from "@/types";

const SIDEBAR_WIDTH = 240;

interface SidebarProps {
  albums: Album[];
}

const navItemSx = {
  borderRadius: 1,
  mb: 0.5,
  color: "text.primary",
  "&.Mui-selected": {
    bgcolor: "action.selected",
    color: "secondary.main",
  },
  "&:hover": {
    bgcolor: "action.hover",
  },
};

function SidebarContent({ albums, onNavigate }: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 16 }}>
        <Image alt="logo" src="/logo.svg" width={36} height={36} />
      </Link>

      <List disablePadding>
        <ListItemButton
          component={Link}
          href="/photography"
          selected={pathname === "/photography"}
          onClick={onNavigate}
          sx={navItemSx}
        >
          <CollectionsIcon sx={{ mr: 1.5, fontSize: 20 }} />
          <ListItemText primary="Albums" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>

        <ListItemButton
          component={Link}
          href="/photography/all"
          selected={pathname === "/photography/all"}
          onClick={onNavigate}
          sx={navItemSx}
        >
          <PhotoLibraryIcon sx={{ mr: 1.5, fontSize: 20 }} />
          <ListItemText primary="All Photos" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </List>

      {albums.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 600, px: 1, mb: 0.5 }}
          >
            Albums
          </Typography>
          <List disablePadding>
            {albums.map((album) => (
              <ListItemButton
                key={album.slug}
                component={Link}
                href={`/photography/${album.slug}`}
                selected={pathname === `/photography/${album.slug}`}
                onClick={onNavigate}
                sx={{ ...navItemSx, py: 0.5 }}
              >
                <ListItemText
                  primary={album.name}
                  secondary={`${album.photoCount} photos`}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}

export default function Sidebar({ albums }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1200,
          bgcolor: "background.default",
          boxShadow: 1,
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH },
        }}
      >
        <SidebarContent albums={albums} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: SIDEBAR_WIDTH,
          bgcolor: "background.default",
          borderRight: "1px solid",
          borderColor: "divider",
          overflowY: "auto",
          zIndex: 10,
        }}
      >
        <SidebarContent albums={albums} />
      </Box>
    </>
  );
}
