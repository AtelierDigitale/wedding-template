import { NextRequest, NextResponse } from "next/server";

export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "";
}
export function checkIsLocal() {
  const url = getApiUrl();
  return !url || url === "local";
}

// Keep for backward compat
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

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") || "application/json",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const isMultipart = (req.headers.get("content-type") || "").includes("multipart/form-data");

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (isMultipart) {
      body = await req.arrayBuffer();
      // Keep original content-type with boundary
      headers["Content-Type"] = req.headers.get("content-type") || "";
    } else {
      body = await req.text();
    }
  }

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
}
