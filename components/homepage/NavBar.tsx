"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const routes = ["About", "Experience", "Contact"];

const navButtonSx = {
  color: "text.primary",
  fontSize: "1rem",
  fontWeight: 600,
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 6,
    left: "50%",
    width: 0,
    height: 2,
    bgcolor: "secondary.main",
    transition: "all 0.3s ease",
    transform: "translateX(-50%)",
  },
  "&:hover::after": { width: "60%" },
  "&:hover": { color: "secondary.main", bgcolor: "transparent" },
};

export function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        <a href="#home">
          <Image alt="logo" src="/logo.svg" width={40} height={40} />
        </a>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {routes.map((route) => (
            <Button
              key={route}
              href={`#${route.toLowerCase()}`}
              sx={navButtonSx}
            >
              {route}
            </Button>
          ))}
          <Button component={Link} href="/photography" sx={navButtonSx}>
            Photography
          </Button>
        </Box>

        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: "flex", md: "none" }, color: "text.primary" }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 260, pt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2 }}>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              {routes.map((route) => (
                <ListItemButton
                  key={route}
                  component="a"
                  href={`#${route.toLowerCase()}`}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText
                    primary={route}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: "1.1rem" }}
                  />
                </ListItemButton>
              ))}
              <ListItemButton
                component={Link}
                href="/photography"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>Photography</Typography>}
                />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
