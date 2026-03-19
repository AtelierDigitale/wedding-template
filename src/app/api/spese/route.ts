import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("authorization") === "Bearer admin";
}

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/spese.php`, {
      method: "GET",
      headers: { Authorization: req.headers.get("authorization") || "" },
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { getDb } = await import("@/lib/local-db");
    const db = await getDb();
    const stmt = db.prepare(`
      SELECT s.*, c.nome as categoria_nome
      FROM spese s LEFT JOIN categorie_preventivo c ON s.categoria_id = c.id
      ORDER BY s.created_at
    `);
    const spese: Record<string, unknown>[] = [];
    let totale = 0, saldato = 0, acconto = 0, da_pagare = 0;
    while (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const row: Record<string, unknown> = {};
      cols.forEach((c, i) => { row[c] = vals[i]; });
      spese.push(row);
      const imp = Number(row.importo) || 0;
      totale += imp;
      if (row.stato === "saldato") saldato += imp;
      else if (row.stato === "acconto") acconto += imp;
      else da_pagare += imp;
    }
    stmt.free();
    return NextResponse.json({ spese, totali: { totale, saldato, acconto, da_pagare } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/spese.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: req.headers.get("authorization") || "" },
      body: bodyText,
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = JSON.parse(bodyText);
    const { descrizione, importo, categoria_id, nota } = body;
    if (!descrizione || importo === undefined) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run("INSERT INTO spese (categoria_id, descrizione, importo, nota, manuale) VALUES (?, ?, ?, ?, 1)",
      [categoria_id || null, descrizione.trim(), parseFloat(importo), nota || null]);
    saveDb();

    const stmt = db.prepare("SELECT last_insert_rowid() as id");
    stmt.step(); const id = stmt.get()[0]; stmt.free();
    return NextResponse.json({ id, ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/spese.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: req.headers.get("authorization") || "" },
      body: bodyText,
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = JSON.parse(bodyText);
    const { id, stato } = body;
    if (!id || !["da_pagare", "acconto", "saldato"].includes(stato))
      return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run("UPDATE spese SET stato = ? WHERE id = ?", [stato, id]);
    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/spese.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: req.headers.get("authorization") || "" },
      body: bodyText,
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = JSON.parse(bodyText);
    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    // Check if manual
    const stmt = db.prepare("SELECT manuale FROM spese WHERE id = ?");
    stmt.bind([id]);
    if (stmt.step()) {
      const manuale = stmt.get()[0];
      stmt.free();
      if (!manuale) return NextResponse.json({ error: "Le spese da preventivo si eliminano dalla sezione preventivi" }, { status: 400 });
    } else { stmt.free(); }

    db.run("DELETE FROM spese WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
