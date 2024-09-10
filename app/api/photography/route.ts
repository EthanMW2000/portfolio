import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import exifr from "exifr";

const imageClient = new S3Client();
const imageBucket = process.env.S3_BUCKET_NAME;
const imagePrefix = process.env.S3_BUCKET_PREFIX;

async function getImageMetadata(url: string): Promise<any> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();

  try {
    const metadata = await exifr.parse(arrayBuffer);
    return metadata;
  } catch (e) {
    console.error("Error parsing metadata", e);
  }
}

export async function GET(_: Request) {
  const allObjects = [];
  let continuationToken;

  do {
    const params: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: imageBucket,
      Prefix: imagePrefix,
      ContinuationToken: continuationToken,
    });

    const response = await imageClient.send(params);
    const objects = response.Contents || [];

    allObjects.push(...objects);
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  const filteredImages = allObjects
    .filter((image) => {
      return image.Key !== imagePrefix;
    })
    .map((image) => {
      return image.Key;
    });

  try {
    const imageDataPromises = await Promise.allSettled(
      filteredImages.map(async (image) => {
        const params: GetObjectCommand = new GetObjectCommand({
          Bucket: imageBucket,
          Key: image,
        });

        const url = await getSignedUrl(imageClient, params, {
          expiresIn: 3600,
        });
        const metadata = await getImageMetadata(url);

        return {
          url,
          metadata,
        };
      })
    );

    const imageData = imageDataPromises
      .filter((promise) => promise.status === "fulfilled")
      .map((promise) => promise.value);

    return new Response(JSON.stringify(imageData));
  } catch (err) {
    console.log(err);
    return new Response("Error fetching images", { status: 500 });
  }
}
