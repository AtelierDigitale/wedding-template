import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin";
}

async function localQueryAll(sql: string, params: unknown[] = []) {
  const { getDb } = await import("@/lib/local-db");
  const db = await getDb();
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
  const proxied = await proxyToBackend(req, "gruppi.php");
  if (proxied) return proxied;

  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const gruppi = await localQueryAll(
      `SELECT g.*,
        (SELECT COUNT(*) FROM inviti WHERE gruppo_id = g.id) as totale_inviti,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id) as totale_invitati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 1) as confermati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 0) as rifiutati,
        (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato IS NULL) as in_attesa
       FROM gruppi g ORDER BY g.nome`
    );
    return NextResponse.json(gruppi);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    // Production: proxy directly to SiteGround
    const bodyText = await req.text();
    const res = await fetch(`${apiUrl}/siteground-api/api/gruppi.php`, {
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

  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { getDb, saveDb } = await import("@/lib/local-db");
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const bodyText = await req.text();
  const proxied = await proxyToBackend(req, "gruppi.php", bodyText);
  if (proxied) return proxied;

  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    const { id, nome } = JSON.parse(bodyText);
    if (!id || !nome || !nome.trim()) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }
    db.run("UPDATE gruppi SET nome = ? WHERE id = ?", [nome.trim(), id]);
    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const bodyText = await req.text();
  const proxied = await proxyToBackend(req, "gruppi.php", bodyText);
  if (proxied) return proxied;

  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    const { id } = JSON.parse(bodyText);
    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }
    db.run("UPDATE inviti SET gruppo_id = NULL WHERE gruppo_id = ?", [id]);
    db.run("DELETE FROM gruppi WHERE id = ?", [id]);
    saveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
