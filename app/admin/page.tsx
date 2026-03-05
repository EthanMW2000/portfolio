import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AlbumIcon from "@mui/icons-material/Album";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mockRequest = new NextRequest("http://localhost/admin", {
    headers: { cookie: cookieHeader },
  });

  const session = await getSession(mockRequest);
  if (!session) redirect("/api/auth/login");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        p: { xs: 2, sm: 4 },
        pt: { xs: 4, sm: 8 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Typography
          variant="h3"
          color="text.primary"
          sx={{ mb: 4, fontWeight: 700 }}
        >
          Admin
        </Typography>

        <Stack spacing={2}>
          <Card>
            <CardActionArea component={Link} href="/admin/photos">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhotoCameraIcon
                    sx={{ fontSize: 40, color: "secondary.main" }}
                  />
                  <Box>
                    <Typography variant="h6">Photography</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload photos to albums
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card>
            <CardActionArea component={Link} href="/admin/vinyl">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AlbumIcon
                    sx={{ fontSize: 40, color: "secondary.main" }}
                  />
                  <Box>
                    <Typography variant="h6">Vinyl Collection</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Import and manage records
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
