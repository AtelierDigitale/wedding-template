import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/local-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitati } = body;

    if (!invitati || !Array.isArray(invitati)) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

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
    console.error("POST /api/conferma error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
