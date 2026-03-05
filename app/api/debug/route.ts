import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    hasRoleArn: !!process.env.AWS_ROLE_ARN,
    roleArn: process.env.AWS_ROLE_ARN ?? null,
    region: process.env.AWS_REGION ?? null,
  });
}
