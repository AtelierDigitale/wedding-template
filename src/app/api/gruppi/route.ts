import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/local-db";
import type { Database, BindParams } from "sql.js";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin";
}

function queryAll(db: Database, sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as BindParams);
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
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    const gruppi = queryAll(db,
      `SELECT g.*,
        (SELECT COUNT(*) FROM inviti WHERE gruppo_id = g.id) as totale_inviti,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id) as totale_invitati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 1) as confermati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 0) as rifiutati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato IS NULL) as in_attesa
       FROM gruppi g
       ORDER BY g.nome`
    );

    return NextResponse.json(gruppi);
  } catch (err) {
    console.error("GET /api/gruppi error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const { nome } = await req.json();

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: "Nome mancante" }, { status: 400 });
    }

    db.run("INSERT INTO gruppi (nome) VALUES (?)", [nome.trim()]);
    saveDb();

    const stmt = db.prepare("SELECT last_insert_rowid() as id");
    stmt.step();
    const id = stmt.get()[0];
    stmt.free();

    return NextResponse.json({ id, nome: nome.trim() });
  } catch (err) {
    console.error("POST /api/gruppi error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const { id, nome } = await req.json();

    if (!id || !nome || !nome.trim()) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    db.run("UPDATE gruppi SET nome = ? WHERE id = ?", [nome.trim(), id]);
    saveDb();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/gruppi error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    db.run("UPDATE inviti SET gruppo_id = NULL WHERE gruppo_id = ?", [id]);
    db.run("DELETE FROM gruppi WHERE id = ?", [id]);
    saveDb();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/gruppi error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
