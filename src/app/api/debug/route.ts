import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  // Test: create a group directly (same code as gruppi POST)
  let postResult = "skipped";
  if (apiUrl && apiUrl !== "local") {
    try {
      const res = await fetch(`${apiUrl}/siteground-api/api/gruppi.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin",
        },
        body: JSON.stringify({ nome: "DebugDirect_" + Date.now() }),
      });
      postResult = `status=${res.status}, body=${await res.text()}`;
    } catch (e) {
      postResult = `error: ${e}`;
    }
  }

  // Test: list groups
  let getResult = "skipped";
  if (apiUrl && apiUrl !== "local") {
    try {
      const res = await fetch(`${apiUrl}/siteground-api/api/gruppi.php`, {
        method: "GET",
        headers: { "Authorization": "Bearer admin" },
      });
      getResult = `status=${res.status}, body=${await res.text()}`;
    } catch (e) {
      getResult = `error: ${e}`;
    }
  }

  return NextResponse.json({ apiUrl, postResult, getResult });
}
