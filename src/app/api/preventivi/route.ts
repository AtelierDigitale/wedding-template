import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("authorization") === "Bearer admin";
}

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const url = new URL(req.url);
    const qs = url.search || "";
    const res = await proxyFetch(`${apiUrl}/api/preventivi.php${qs}`, {
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
    const url = new URL(req.url);
    const categoriaId = url.searchParams.get("categoria_id");

    let sql: string;
    const params: unknown[] = [];

    if (categoriaId) {
      sql = `SELECT p.*, u.nome as created_by_nome, u.ruolo as created_by_ruolo
             FROM preventivi p LEFT JOIN utenti u ON p.created_by = u.id
             WHERE p.categoria_id = ? ORDER BY p.created_at`;
      params.push(categoriaId);
    } else {
      sql = `SELECT p.*, u.nome as created_by_nome, u.ruolo as created_by_ruolo,
                    c.nome as categoria_nome
             FROM preventivi p
             LEFT JOIN utenti u ON p.created_by = u.id
             LEFT JOIN categorie_preventivo c ON p.categoria_id = c.id
             ORDER BY p.categoria_id, p.created_at`;
    }

    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params as import("sql.js").BindParams);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row: Record<string, unknown> = {};
      columns.forEach((col, i) => { row[col] = values[i]; });
      row.allegati = [];
      rows.push(row);
    }
    stmt.free();

    // Attach allegati
    for (const row of rows) {
      const stmtA = db.prepare("SELECT * FROM preventivi_allegati WHERE preventivo_id = ? ORDER BY uploaded_at");
      stmtA.bind([row.id as number]);
      const allegati: Record<string, unknown>[] = [];
      while (stmtA.step()) {
        const c = stmtA.getColumnNames();
        const v = stmtA.get();
        const a: Record<string, unknown> = {};
        c.forEach((col, i) => { a[col] = v[i]; });
        allegati.push(a);
      }
      stmtA.free();
      row.allegati = allegati;
    }

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/preventivi.php`, {
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
    const { categoria_id, fornitore, descrizione, prezzo, note, created_by } = body;
    if (!categoria_id || !fornitore || prezzo === undefined) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run(
      "INSERT INTO preventivi (categoria_id, fornitore, descrizione, prezzo, note, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [categoria_id, fornitore.trim(), descrizione || null, parseFloat(prezzo), note || null, created_by]
    );
    saveDb();

    const stmt = db.prepare("SELECT last_insert_rowid() as id");
    stmt.step();
    const id = stmt.get()[0];
    stmt.free();

    return NextResponse.json({ id, categoria_id, fornitore, prezzo: parseFloat(prezzo) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/preventivi.php`, {
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
    const { id, action } = body;
    if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();

    if (action === "scegli") {
      const stmt = db.prepare("SELECT categoria_id, fornitore, prezzo FROM preventivi WHERE id = ?");
      stmt.bind([id]);
      if (!stmt.step()) { stmt.free(); return NextResponse.json({ error: "Non trovato" }, { status: 404 }); }
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const prev: Record<string, unknown> = {};
      cols.forEach((c, i) => { prev[c] = vals[i]; });
      stmt.free();

      db.run("UPDATE preventivi SET scelto = 0 WHERE categoria_id = ?", [prev.categoria_id as number]);
      db.run("UPDATE preventivi SET scelto = 1 WHERE id = ?", [id]);
      db.run("DELETE FROM spese WHERE categoria_id = ? AND manuale = 0", [prev.categoria_id as number]);
      db.run("INSERT INTO spese (categoria_id, preventivo_id, descrizione, importo, manuale) VALUES (?, ?, ?, ?, 0)",
        [prev.categoria_id as number, id, prev.fornitore as string, prev.prezzo as number]);
      saveDb();
      return NextResponse.json({ ok: true, spesa_created: true });
    }

    if (action === "descegli") {
      db.run("UPDATE preventivi SET scelto = 0 WHERE id = ?", [id]);
      db.run("DELETE FROM spese WHERE preventivo_id = ?", [id]);
      saveDb();
      return NextResponse.json({ ok: true });
    }

    // Update fields
    const { fornitore, descrizione, prezzo, note: bodyNote } = body;
    if (!fornitore || prezzo === undefined) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    db.run("UPDATE preventivi SET fornitore = ?, descrizione = ?, prezzo = ?, note = ? WHERE id = ?",
      [fornitore.trim(), descrizione || null, parseFloat(prezzo), bodyNote || null, id]);
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
    const res = await proxyFetch(`${apiUrl}/api/preventivi.php`, {
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
    db.run("DELETE FROM spese WHERE preventivo_id = ?", [id]);
    db.run("DELETE FROM preventivi WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
