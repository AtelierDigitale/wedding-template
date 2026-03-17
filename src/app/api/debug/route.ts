import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";
  return NextResponse.json({ apiUrl });
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";

  // Read the body
  const bodyText = await req.text();

  // Try to proxy it manually
  let result = "skipped";
  try {
    const res = await fetch(`${apiUrl}/siteground-api/api/gruppi.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer admin",
      },
      body: bodyText,
    });
    result = `status=${res.status}, body=${await res.text()}`;
  } catch (e) {
    result = `error: ${e}`;
  }

  return NextResponse.json({ apiUrl, bodyReceived: bodyText, proxyResult: result });
}
