import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";

export default function Sidebar() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 56,
        bgcolor: "background.default",
        borderRight: "1px solid",
        borderColor: "divider",
        zIndex: 10,
        transition: "width 0.2s ease",
        overflow: "hidden",
        "&:hover": { width: 208 },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 1 }}>
        <Link href="/">
          <Image alt="logo" src="/logo.svg" width={36} height={36} />
        </Link>
      </Box>
    </Box>
  );
}
