import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const url = new URL(req.url);
    const qs = url.search || "";
    const res = await fetch(`${apiUrl}/siteground-api/api/gallery.php${qs}`, {
      method: "GET",
      headers: {
        "Authorization": req.headers.get("authorization") || "",
      },
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { getDb } = await import("@/lib/local-db");
    const db = await getDb();

    const stmt = db.prepare(
      "SELECT id, filename, nome_autore, commento, uploaded_at FROM foto ORDER BY uploaded_at DESC"
    );
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row: Record<string, unknown> = {};
      columns.forEach((col, i) => { row[col] = values[i]; });
      rows.push(row);
    }
    stmt.free();

    const result = rows.map((f) => ({
      id: f.id,
      url: `/uploads/foto/${f.filename}`,
      nome_autore: f.nome_autore,
      commento: f.commento,
      uploaded_at: f.uploaded_at,
    }));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
