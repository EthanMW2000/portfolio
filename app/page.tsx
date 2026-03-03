import Box from "@mui/material/Box";
import { NavBar } from "@/components/homepage/NavBar";
import { Intro } from "@/components/homepage/Intro";
import { About } from "@/components/homepage/About";
import { Experience } from "@/components/homepage/Experience";
import { Contact } from "@/components/homepage/Contact";

export default function Home() {
  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
      <NavBar />
      <Box component="main">
        <Intro />
        <About />
        <Experience />
        <Contact />
      </Box>
    </Box>
  );
}
