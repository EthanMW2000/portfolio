import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const imageClient = new S3Client({ region: process.env.S3_BUCKET_REGION });
const imageBucket = process.env.S3_BUCKET_NAME;
const imagePrefix = process.env.S3_BUCKET_PREFIX;

const retrieveImageCommand = new ListObjectsV2Command({
  Bucket: imageBucket,
  Prefix: imagePrefix,
});

async function retrieveImages() {
  const { Contents } = await imageClient.send(retrieveImageCommand);
  if (!Contents) {
    throw new Error("No images found");
  }
  return Contents;
}

export async function GET(request: Request) {
  const images = await retrieveImages();
  const filteredImages = images.filter((image) => {
    return image.Key !== imagePrefix;
  }).map((image) => {return image.Key});

  return new Response(JSON.stringify(filteredImages), {
    headers: { "content-type": "application/json" },
  });
}
