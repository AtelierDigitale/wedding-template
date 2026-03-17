import { NextRequest, NextResponse } from "next/server";

export function getApiUrl() {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
}

export function checkIsLocal() {
  const url = getApiUrl();
  return !url || url === "local";
}

export const isLocal = checkIsLocal();

/**
 * In production, proxy the request to SiteGround PHP backend.
 * For GET/DELETE: forwards method, headers, and query string.
 * For POST/PUT: reads body as text first, then forwards it.
 */
export async function proxyToBackend(
  req: NextRequest,
  phpFile: string,
  bodyText?: string
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

  const isMultipart = (headers["Content-Type"] || "").includes("multipart/form-data");

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (bodyText !== undefined) {
      body = bodyText;
    } else if (isMultipart) {
      body = Buffer.from(await req.arrayBuffer());
    } else {
      body = await req.text();
    }
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
