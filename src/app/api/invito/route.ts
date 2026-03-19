import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const url = new URL(req.url);
    const qs = url.search || "";
    const res = await proxyFetch(`${apiUrl}/api/invito.php${qs}`, {
      method: "GET",
      headers: {
        "Authorization": req.headers.get("authorization") || "",
      },
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token mancante" }, { status: 400 });
    }

    const { getDb } = await import("@/lib/local-db");
    const db = await getDb();

    const s1 = db.prepare("SELECT id, token, nome_gruppo, note FROM inviti WHERE token = ?");
    s1.bind([token]);
    if (!s1.step()) {
      s1.free();
      return NextResponse.json({ error: "Invito non trovato" }, { status: 404 });
    }
    const cols1 = s1.getColumnNames();
    const vals1 = s1.get();
    const invito: Record<string, unknown> = {};
    cols1.forEach((col, i) => { invito[col] = vals1[i]; });
    s1.free();

    const s2 = db.prepare("SELECT id, nome, genere, confermato FROM invitati WHERE invito_id = ?");
    s2.bind([invito.id as number]);
    const invitati: Record<string, unknown>[] = [];
    while (s2.step()) {
      const c = s2.getColumnNames();
      const v = s2.get();
      const row: Record<string, unknown> = {};
      c.forEach((col, i) => { row[col] = v[i]; });
      invitati.push(row);
    }
    s2.free();

    return NextResponse.json({ invito, invitati });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
