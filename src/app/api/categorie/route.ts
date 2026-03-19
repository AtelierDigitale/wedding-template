import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

function checkAuth(req: NextRequest): boolean {
  return req.headers.get("authorization") === "Bearer admin";
}

async function getLocalDb() {
  const { getDb } = await import("@/lib/local-db");
  return getDb();
}

async function localSaveDb() {
  const { saveDb } = await import("@/lib/local-db");
  saveDb();
}

function queryAll(db: import("sql.js").Database, sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as import("sql.js").BindParams);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    const columns = stmt.getColumnNames();
    const values = stmt.get();
    const row: Record<string, unknown> = {};
    columns.forEach((col, i) => { row[col] = values[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/categorie.php`, {
      method: "GET",
      headers: { Authorization: req.headers.get("authorization") || "" },
    });
    const data = await res.text();
    return new NextResponse(data, { status: res.status, headers: { "Content-Type": "application/json" } });
  }

  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = await getLocalDb();
    const rows = queryAll(db, `
      SELECT c.*,
        (SELECT COUNT(*) FROM preventivi WHERE categoria_id = c.id) as totale_preventivi,
        (SELECT COUNT(*) FROM preventivi WHERE categoria_id = c.id AND scelto = 1) as preventivo_scelto,
        (SELECT COALESCE(SUM(prezzo), 0) FROM preventivi WHERE categoria_id = c.id AND scelto = 1) as importo_scelto
      FROM categorie_preventivo c
      ORDER BY c.ordine, c.nome
    `);
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/categorie.php`, {
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
    const nome = (body.nome || "").trim();
    const icona = (body.icona || "").trim();
    const ordine = body.ordine || 0;
    if (!nome) return NextResponse.json({ error: "Nome mancante" }, { status: 400 });

    const db = await getLocalDb();
    db.run("INSERT INTO categorie_preventivo (nome, icona, ordine) VALUES (?, ?, ?)", [nome, icona || null, ordine]);
    localSaveDb();

    const stmt = db.prepare("SELECT last_insert_rowid() as id");
    stmt.step();
    const id = stmt.get()[0];
    stmt.free();

    return NextResponse.json({ id, nome, icona: icona || null, ordine });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/categorie.php`, {
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
    const { id, nome, icona, ordine } = body;
    if (!id || !nome) return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });

    const db = await getLocalDb();
    db.run("UPDATE categorie_preventivo SET nome = ?, icona = ?, ordine = ? WHERE id = ?", [nome, icona || null, ordine || 0, id]);
    localSaveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/categorie.php`, {
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

    const db = await getLocalDb();
    db.run("DELETE FROM categorie_preventivo WHERE id = ?", [id]);
    localSaveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
