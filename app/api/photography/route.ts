import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = "force-dynamic";

const imageClient = new S3Client();
const imageBucket = process.env.S3_BUCKET_NAME;
const imagePrefix = process.env.S3_BUCKET_PREFIX;

export async function GET(request: Request) {
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
    const signedUrls = await Promise.allSettled(
      filteredImages.map((image) => {
        const params: GetObjectCommand = new GetObjectCommand({
          Bucket: imageBucket,
          Key: image,
        });

        return getSignedUrl(imageClient, params, { expiresIn: 3600 });
      })
    );

    return new Response(JSON.stringify(signedUrls));
  } catch (err) {
    console.log(err);
    return new Response("Error fetching images", { status: 500 });
  }
}
