import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const db = await getDb();

    const foto = queryAll(db,
      "SELECT id, filename, nome_autore, commento, uploaded_at FROM foto ORDER BY uploaded_at DESC"
    );

    const result = foto.map((f) => ({
      id: f.id,
      url: `/uploads/foto/${f.filename}`,
      nome_autore: f.nome_autore,
      commento: f.commento,
      uploaded_at: f.uploaded_at,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
