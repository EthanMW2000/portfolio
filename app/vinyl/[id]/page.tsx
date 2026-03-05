import { notFound } from "next/navigation";
import { getRecordWithTracks } from "@/lib/vinyl";
import VinylDetail from "@/components/vinyl/VinylDetail";

interface VinylDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VinylDetailPage({ params }: VinylDetailPageProps) {
  const { id } = await params;
  const record = await getRecordWithTracks(id);

  if (!record) notFound();

  return <VinylDetail record={record} />;
}
