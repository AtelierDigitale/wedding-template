import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  // Test: create a group directly (same code as gruppi POST)
  let postResult = "skipped";
  if (apiUrl && apiUrl !== "local") {
    try {
      const res = await proxyFetch(`${apiUrl}/api/gruppi.php`, {
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
      const res = await proxyFetch(`${apiUrl}/api/gruppi.php`, {
        method: "GET",
        headers: { "Authorization": "Bearer admin" },
      });
      getResult = `status=${res.status}, body=${await res.text()}`;
    } catch (e) {
      getResult = `error: ${e}`;
    }
  }

  // Debug auth env vars (masked)
  const u = process.env.ADMIN_USERNAME || "(not set)";
  const p = process.env.ADMIN_PASSWORD || "(not set)";

  return NextResponse.json({
    apiUrl,
    postResult,
    getResult,
    auth_debug: {
      username: u.length > 2 ? u[0] + "***" + u[u.length - 1] : u,
      username_length: u.length,
      password: p.length > 2 ? p[0] + "***" + p[p.length - 1] : p,
      password_length: p.length,
    },
  });
}
