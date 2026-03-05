import { NextResponse } from "next/server";

export async function GET() {
  const vercelVars = Object.keys(process.env)
    .filter((k) => k.startsWith("VERCEL_") || k.startsWith("AWS_"))
    .reduce<Record<string, string>>((acc, k) => {
      acc[k] = k.includes("SECRET") || k.includes("TOKEN") || k.includes("KEY")
        ? "[set]"
        : process.env[k]!;
      return acc;
    }, {});

  return NextResponse.json(vercelVars);
}
