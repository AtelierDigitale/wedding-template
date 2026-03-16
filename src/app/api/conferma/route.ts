import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const proxied = await proxyToBackend(req, "conferma.php");
  if (proxied) return proxied;

  try {
    const body = await req.json();
    const { invitati } = body;
    if (!invitati || !Array.isArray(invitati)) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();

    for (const inv of invitati) {
      db.run(
        "UPDATE invitati SET confermato = ?, confirmed_at = datetime('now') WHERE id = ?",
        [inv.confermato ? 1 : 0, inv.id]
      );
    }

    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
