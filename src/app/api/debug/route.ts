import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";

  // Test POST to SiteGround directly
  let postTest = "skipped";
  try {
    const res = await fetch(`${apiUrl}/siteground-api/api/gruppi.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer admin",
      },
      body: JSON.stringify({ nome: "DebugTest" }),
    });
    postTest = `status=${res.status}, body=${await res.text()}`;
  } catch (e) {
    postTest = `error: ${e}`;
  }

  return NextResponse.json({ apiUrl, postTest });
}
