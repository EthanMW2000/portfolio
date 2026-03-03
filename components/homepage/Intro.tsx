import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export function Intro() {
  return (
    <Box
      id="home"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(170deg, #1b2541 0%, #0f1729 100%)",
        color: "#fff",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ color: "#fff", mb: 1 }}>
          Ethan Wells
        </Typography>
        <Typography variant="h2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Software Engineer
        </Typography>

        <Typography
          variant="body1"
          sx={{ fontSize: "1.125rem", maxWidth: 560, color: "rgba(255,255,255,0.8)" }}
        >
          I build across the <strong>full stack</strong> — from frontend
          interfaces to APIs, databases, and <strong>cloud infrastructure</strong>.
        </Typography>

        <Button
          variant="contained"
          href="#about"
          endIcon={<ArrowForwardIcon />}
          size="large"
          sx={{
            mt: 4,
            bgcolor: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.25)",
            },
          }}
        >
          Discover More
        </Button>
      </Container>
    </Box>
  );
}
