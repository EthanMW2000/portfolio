import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const imageClient = new S3Client([
  {
    region: process.env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  },
]);

const retrieveImageCommand = new ListObjectsV2Command({
  Bucket: process.env.S3_BUCKET_NAME,
  Prefix: process.env.S3_BUCKET_PREFIX,
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
  return new Response(JSON.stringify(images), {
    headers: { "content-type": "application/json" },
  });
}
