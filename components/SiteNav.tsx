"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const links = [
  { label: "Portfolio", href: "/" },
  { label: "Photography", href: "/photography" },
  { label: "Vinyl", href: "/vinyl" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        variant="dense"
        sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, minHeight: 48 }}
      >
        <Link href="/">
          <Image alt="logo" src="/logo.svg" width={28} height={28} />
        </Link>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {links.map(({ label, href }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Button
                key={href}
                component={Link}
                href={href}
                size="small"
                sx={{
                  color: isActive ? "secondary.main" : "text.secondary",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  minWidth: 0,
                  px: 1.5,
                  "&:hover": {
                    color: "secondary.main",
                    bgcolor: "transparent",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
