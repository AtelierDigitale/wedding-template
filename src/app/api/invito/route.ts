import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  const proxied = await proxyToBackend(req, "invito.php");
  if (proxied) return proxied;

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
