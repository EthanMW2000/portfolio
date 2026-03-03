import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import experiences from "@/assets/experience.json";

export function Experience() {
  return (
    <Box id="experience" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 6 }}>
          Experience
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mb: 10 }}>
          {experiences.work.map((work, index) => (
            <Card key={work.employer} sx={{ position: "relative", overflow: "visible" }}>
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 24, md: 40 },
                  top: -12,
                  bgcolor: "secondary.main",
                  color: "#fff",
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {work.duration}
              </Box>
              <CardContent sx={{ p: { xs: 3, md: 4 }, pt: { xs: 4, md: 5 } }}>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {work.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontWeight: 500 }}>
                  {work.employer}
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, mb: 2.5 }}>
                  {work.descriptions.map((desc) => (
                    <Typography component="li" variant="body2" key={desc} sx={{ mb: 0.5, color: "text.secondary" }}>
                      {desc}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {work.technologies.map((tech) => (
                    <Chip key={tech} label={tech} size="small" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="h2" sx={{ mb: 6 }}>
          Projects
        </Typography>

        <Grid container spacing={3}>
          {experiences.projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.name}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, flex: 1 }}>
                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontWeight: 500 }}>
                    {project.type}
                  </Typography>
                  {Array.isArray(project.description) ? (
                    <Box component="ul" sx={{ pl: 2.5, mb: 2.5 }}>
                      {project.description.map((desc) => (
                        <Typography component="li" variant="body2" key={desc} sx={{ mb: 0.5, color: "text.secondary" }}>
                          {desc}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
                      {project.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: "auto" }}>
                    {project.technologies?.map((tech) => (
                      <Chip key={tech} label={tech} size="small" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
