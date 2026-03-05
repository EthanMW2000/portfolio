import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

function buildCredentials() {
  if (process.env.VERCEL) {
    return awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN! });
  }
  return undefined;
}

export function buildS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: buildCredentials(),
  });
}

export function buildDynamoClient(): DynamoDBDocumentClient {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: buildCredentials(),
  });
  return DynamoDBDocumentClient.from(client);
}

export const bucket = process.env.S3_BUCKET_NAME!;
export const cdnDomain = process.env.CLOUDFRONT_DOMAIN!;

export function cdnUrl(key: string): string {
  return `https://${cdnDomain}/${key}`;
}
