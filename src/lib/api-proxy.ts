import { NextRequest, NextResponse } from "next/server";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}
export function checkIsLocal() {
  const url = getApiUrl();
  return !url || url === "local";
}

export const isLocal = checkIsLocal();

/**
 * In production, proxy the request to SiteGround PHP backend.
 * Returns a NextResponse if proxied, or null if local (caller should handle).
 */
export async function proxyToBackend(
  req: NextRequest,
  phpFile: string
): Promise<NextResponse | null> {
  const apiUrl = getApiUrl();
  if (!apiUrl || apiUrl === "local") return null;

  const url = new URL(req.url);
  const destination = `${apiUrl}/siteground-api/api/${phpFile}${url.search}`;

  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  // Clone the body from the request
  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Use clone() to ensure the body stream hasn't been consumed
    body = await req.clone().arrayBuffer();
    if (!contentType) headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(destination, {
      method: req.method,
      headers,
      body,
    });

    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: `Proxy error: ${e}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
