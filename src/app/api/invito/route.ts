import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/local-db";
import type { Database, BindParams } from "sql.js";

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

function queryOne(db: Database, sql: string, params: unknown[] = []) {
  const rows = queryAll(db, sql, params);
  return rows[0] || null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token mancante" }, { status: 400 });
    }

    const db = await getDb();

    const invito = queryOne(db,
      "SELECT id, token, nome_gruppo, note FROM inviti WHERE token = ?",
      [token]
    );

    if (!invito) {
      return NextResponse.json({ error: "Invito non trovato" }, { status: 404 });
    }

    const invitati = queryAll(db,
      "SELECT id, nome, genere, confermato FROM invitati WHERE invito_id = ?",
      [invito.id as number]
    );

    return NextResponse.json({ invito, invitati });
  } catch (err) {
    console.error("GET /api/invito error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
