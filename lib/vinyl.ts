import {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { buildDynamoClient } from "@/lib/aws";
import type {
  VinylRecord,
  VinylTrack,
  VinylRecordWithTracks,
  VinylCollectionStats,
} from "@/types";

const db = buildDynamoClient();
const recordsTable = process.env.DYNAMODB_VINYL_RECORDS_TABLE!;
const tracksTable = process.env.DYNAMODB_VINYL_TRACKS_TABLE!;

export async function getAllRecords(): Promise<VinylRecord[]> {
  const result = await db.send(new ScanCommand({ TableName: recordsTable }));
  const records = (result.Items ?? []) as VinylRecord[];
  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRecord(id: string): Promise<VinylRecord | null> {
  const result = await db.send(
    new GetCommand({ TableName: recordsTable, Key: { id } })
  );
  return (result.Item as VinylRecord) ?? null;
}

export async function getRecordWithTracks(
  id: string
): Promise<VinylRecordWithTracks | null> {
  const record = await getRecord(id);
  if (!record) return null;

  const result = await db.send(
    new QueryCommand({
      TableName: tracksTable,
      IndexName: "record_id-index",
      KeyConditionExpression: "recordId = :rid",
      ExpressionAttributeValues: { ":rid": id },
    })
  );

  const tracks = ((result.Items ?? []) as VinylTrack[]).sort(
    (a, b) => a.discNumber - b.discNumber || a.trackNumber - b.trackNumber
  );

  return { ...record, tracks };
}

export async function getCollectionStats(): Promise<VinylCollectionStats> {
  const records = await getAllRecords();
  const artists = new Set(records.map((r) => r.artist));

  const totalTracks = records.reduce((sum, r) => sum + r.trackCount, 0);

  return {
    totalRecords: records.length,
    totalTracks,
    uniqueArtists: artists.size,
  };
}

export async function createRecord(record: VinylRecord): Promise<void> {
  await db.send(new PutCommand({ TableName: recordsTable, Item: record }));
}

export async function createTracks(tracks: VinylTrack[]): Promise<void> {
  const chunks: VinylTrack[][] = [];
  for (let i = 0; i < tracks.length; i += 25) {
    chunks.push(tracks.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await db.send(
      new BatchWriteCommand({
        RequestItems: {
          [tracksTable]: chunk.map((track) => ({
            PutRequest: { Item: track },
          })),
        },
      })
    );
  }
}

export async function deleteRecordAndTracks(id: string): Promise<void> {
  const result = await db.send(
    new QueryCommand({
      TableName: tracksTable,
      IndexName: "record_id-index",
      KeyConditionExpression: "recordId = :rid",
      ExpressionAttributeValues: { ":rid": id },
      ProjectionExpression: "id",
    })
  );

  const trackIds = (result.Items ?? []).map((item) => item.id as string);

  const chunks: string[][] = [];
  for (let i = 0; i < trackIds.length; i += 25) {
    chunks.push(trackIds.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await db.send(
      new BatchWriteCommand({
        RequestItems: {
          [tracksTable]: chunk.map((trackId) => ({
            DeleteRequest: { Key: { id: trackId } },
          })),
        },
      })
    );
  }

  await db.send(new DeleteCommand({ TableName: recordsTable, Key: { id } }));
}

export async function getAllFingerprints(): Promise<
  { trackId: string; recordId: string; fingerprint: number[] }[]
> {
  const result = await db.send(
    new ScanCommand({
      TableName: tracksTable,
      FilterExpression: "attribute_exists(fingerprint)",
      ProjectionExpression: "id, recordId, fingerprint",
    })
  );

  return (result.Items ?? [])
    .filter((item) => item.fingerprint && item.fingerprint.length > 0)
    .map((item) => ({
      trackId: item.id as string,
      recordId: item.recordId as string,
      fingerprint: item.fingerprint as number[],
    }));
}
