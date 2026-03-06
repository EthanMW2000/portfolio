import { getAllRecords, getCollectionStats } from "@/lib/vinyl";
import VinylCollection from "@/components/vinyl/VinylCollection";

export default async function VinylPage() {
  const [records, stats] = await Promise.all([
    getAllRecords(),
    getCollectionStats(),
  ]);

  return <VinylCollection records={records} stats={stats} />;
}
