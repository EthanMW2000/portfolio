import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import VinylAdmin from "@/components/admin/VinylAdmin";

export default async function AdminVinylPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mockRequest = new NextRequest("http://localhost/admin/vinyl", {
    headers: { cookie: cookieHeader },
  });

  const session = await getSession(mockRequest);
  if (!session) redirect("/api/auth/login");

  return <VinylAdmin />;
}
