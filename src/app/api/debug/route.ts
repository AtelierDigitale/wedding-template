import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    API_URL: process.env.API_URL || "(not set)",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "(not set)",
    resolved: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "(none)",
  });
}
