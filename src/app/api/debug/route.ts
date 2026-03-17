import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";
  const isLocal = !apiUrl || apiUrl === "local" || apiUrl === "(not set)";

  let proxyTest = "skipped";
  if (!isLocal) {
    try {
      const res = await fetch(`${apiUrl}/siteground-api/api/gallery.php`);
      proxyTest = `status=${res.status}, body=${await res.text()}`;
    } catch (e) {
      proxyTest = `error: ${e}`;
    }
  }

  return NextResponse.json({
    NEXT_PUBLIC_API_URL: apiUrl,
    isLocal,
    proxyTest,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("API") || k.includes("NEXT")),
  });
}
