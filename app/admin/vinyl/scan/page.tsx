import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import VinylScan from "@/components/admin/VinylScan";

export default async function AdminVinylScanPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mockRequest = new NextRequest("http://localhost/admin/vinyl/scan", {
    headers: { cookie: cookieHeader },
  });

  const session = await getSession(mockRequest);
  if (!session) redirect("/api/auth/login?next=/admin/vinyl/scan");

  return <VinylScan />;
}
