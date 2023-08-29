import { ListObjectsV2Command, S3, S3ClientConfig } from "@aws-sdk/client-s3";

const bucketRegion = process.env.NEXT_PUBLIC_S3_REGION as string;
const accessKeyId = process.env.S3_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;

const s3Config: S3ClientConfig = {
  region: bucketRegion,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
};

const credentials = {
  accessKeyId,
  secretAccessKey,
};

const imageClient = new S3({ region: "us-east-2" });

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
  console.log("images", images);
  return new Response(JSON.stringify(images), {
    headers: { "content-type": "application/json" },
  });
}
