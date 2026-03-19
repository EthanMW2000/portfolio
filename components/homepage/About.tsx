import Image from "next/image";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import skills from "@/assets/skills.json";

const skillCategories = [
  { label: "Languages", items: skills.languages },
  { label: "Frontend", items: skills.frontend },
  { label: "Backend", items: skills.backend },
  { label: "Database", items: skills.database },
  { label: "Infrastructure", items: skills.infrastructure },
  { label: "Other", items: skills.other },
  { label: "AI Tools", items: skills.ai_tools },
];

export function About() {
  return (
    <Box id="about" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 6 }}>
          About Me
        </Typography>

        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="body1">
                I&apos;m a software engineer who builds across the full stack — from
                the interfaces people interact with to the APIs, databases, and cloud
                infrastructure behind them. I&apos;ve worked across industries
                including manufacturing and workforce management, and I bring the same
                approach everywhere: understand the problem deeply, then build the
                simplest thing that solves it well.
              </Typography>
              <Typography variant="body1">
                I graduated from Wichita State University with a Bachelor of Science
                in Computer Science. At INVISTA, I build systems that let plant
                operators talk to their factory — a multi-agent AI platform connecting
                work orders, sensor data, and engineering docs through natural language,
                running on top of an enterprise Digital Twin.
              </Typography>
              <Typography variant="body1">
                Outside of work, you&apos;ll find me behind the camera or working on
                side projects.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                width: 280,
                height: 280,
                position: "relative",
              }}
            >
              <Image
                alt="A headshot of Ethan Wells"
                src="/professional-headshot.jpeg"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 8,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          <SchoolOutlinedIcon sx={{ color: "secondary.main", fontSize: 28 }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Bachelor of Science in Computer Science
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Wichita State University — Fall 2023
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="h3" sx={{ mb: 4 }}>
            Skills
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {skillCategories.map((category) => (
              <Box key={category.label}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1, color: "text.secondary", textTransform: "uppercase", letterSpacing: 1 }}
                >
                  {category.label}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {category.items.map((skill) => (
                    <Chip key={skill} label={skill} size="medium" />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
