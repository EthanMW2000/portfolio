import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getAlbums } from "@/lib/photography";
import UploadForm from "@/components/admin/UploadForm";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mockRequest = new NextRequest("http://localhost/admin", {
    headers: { cookie: cookieHeader },
  });

  const session = await getSession(mockRequest);
  if (!session) redirect("/api/auth/login");

  const albums = await getAlbums();
  const albumNames = albums.map((a) => a.slug);

  return <UploadForm albums={albumNames} />;
}
