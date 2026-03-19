import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/conferma.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("authorization") || "",
      },
      body: bodyText,
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = JSON.parse(bodyText);
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
