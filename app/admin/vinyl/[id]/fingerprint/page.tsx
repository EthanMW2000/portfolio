import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getRecordWithTracks } from "@/lib/vinyl";
import FingerprintUpload from "@/components/admin/FingerprintUpload";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FingerprintPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mockRequest = new NextRequest(
    "http://localhost/admin/vinyl/fingerprint",
    { headers: { cookie: cookieHeader } }
  );

  const session = await getSession(mockRequest);
  if (!session) redirect("/api/auth/login");

  const { id } = await params;
  const record = await getRecordWithTracks(id);
  if (!record) notFound();

  return <FingerprintUpload record={record} />;
}
