import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export function Contact() {
  return (
    <Box id="contact" sx={{ py: { xs: 10, md: 14 } }}>
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          Let&apos;s Talk
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
          If you have any questions or would like to get in touch, feel free to
          reach out through any of the links below.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 5 }}>
          <Tooltip title="Email">
            <IconButton
              component="a"
              href="mailto:ethanmw2000@gmail.com"
              sx={{ color: "text.primary", "&:hover": { color: "secondary.main" } }}
            >
              <EmailOutlinedIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="LinkedIn">
            <IconButton
              component="a"
              href="https://www.linkedin.com/in/ethan-wells00/"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "text.primary", "&:hover": { color: "secondary.main" } }}
            >
              <LinkedInIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub">
            <IconButton
              component="a"
              href="https://github.com/EthanMW2000"
              target="_blank"
              rel="noreferrer"
              sx={{ color: "text.primary", "&:hover": { color: "secondary.main" } }}
            >
              <GitHubIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Button
          variant="contained"
          color="secondary"
          href="Wells-Ethan.pdf"
          target="_blank"
          rel="noreferrer"
          startIcon={<DescriptionOutlinedIcon />}
          size="large"
        >
          Resume
        </Button>
      </Container>
    </Box>
  );
}
