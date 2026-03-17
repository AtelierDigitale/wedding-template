import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin";
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

function queryOne(db: import("sql.js").Database, sql: string, params: unknown[] = []) {
  const rows = queryAll(db, sql, params);
  return rows[0] || null;
}

export async function GET(req: NextRequest) {
  const proxied = await proxyToBackend(req, "inviti.php");
  if (proxied) return proxied;

  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getLocalDb();
    const { searchParams } = new URL(req.url);

    if (searchParams.get("id")) {
      const id = Number(searchParams.get("id"));
      const invito = queryOne(db, "SELECT * FROM inviti WHERE id = ?", [id]);
      if (!invito) {
        return NextResponse.json({ error: "Non trovato" }, { status: 404 });
      }
      const invitati = queryAll(db,
        "SELECT id, nome, genere, confermato FROM invitati WHERE invito_id = ?", [id]);
      return NextResponse.json({ invito, invitati });
    }

    if (searchParams.get("stats") === "1") {
      const totals = queryOne(db,
        `SELECT
          (SELECT COUNT(*) FROM inviti) as totale_inviti,
          (SELECT COUNT(*) FROM invitati) as totale_invitati,
          (SELECT COUNT(*) FROM invitati WHERE confermato = 1) as confermati,
          (SELECT COUNT(*) FROM invitati WHERE confermato = 0) as rifiutati,
          (SELECT COUNT(*) FROM invitati WHERE confermato IS NULL) as in_attesa`
      );
      const perGruppo = queryAll(db,
        `SELECT g.id, g.nome,
          (SELECT COUNT(*) FROM inviti WHERE gruppo_id = g.id) as totale_inviti,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id) as totale_invitati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 1) as confermati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato = 0) as rifiutati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id = g.id AND inv.confermato IS NULL) as in_attesa
         FROM gruppi g ORDER BY g.nome`
      );
      const senzaGruppo = queryOne(db,
        `SELECT
          (SELECT COUNT(*) FROM inviti WHERE gruppo_id IS NULL) as totale_inviti,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL) as totale_invitati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato = 1) as confermati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato = 0) as rifiutati,
          (SELECT COUNT(*) FROM invitati inv JOIN inviti i ON inv.invito_id = i.id WHERE i.gruppo_id IS NULL AND inv.confermato IS NULL) as in_attesa`
      );
      return NextResponse.json({ ...totals, per_gruppo: perGruppo, senza_gruppo: senzaGruppo });
    }

    if (searchParams.get("invitati") === "1") {
      const invitati = queryAll(db,
        `SELECT inv.id, inv.nome, inv.genere, inv.confermato, inv.confirmed_at, i.nome_gruppo, g.nome as gruppo
         FROM invitati inv
         JOIN inviti i ON inv.invito_id = i.id
         LEFT JOIN gruppi g ON i.gruppo_id = g.id
         ORDER BY g.nome, i.nome_gruppo, inv.nome`
      );
      return NextResponse.json(invitati);
    }

    const inviti = queryAll(db,
      `SELECT i.*, g.nome as gruppo_nome,
        (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id) as totale_invitati,
        (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato = 1) as confermati,
        (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato = 0) as rifiutati,
        (SELECT COUNT(*) FROM invitati WHERE invito_id = i.id AND confermato IS NULL) as in_attesa
       FROM inviti i
       LEFT JOIN gruppi g ON i.gruppo_id = g.id
       ORDER BY g.nome, i.created_at DESC`
    );
    return NextResponse.json(inviti);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const proxied = await proxyToBackend(req, "inviti.php", bodyText);
  if (proxied) return proxied;

  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const crypto = await import("crypto");
    const db = await getLocalDb();
    const body = JSON.parse(bodyText);
    const { nome_gruppo, gruppo_id, invitati, note } = body;

    if (!nome_gruppo || !invitati || !Array.isArray(invitati) || invitati.length === 0) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    const token = crypto.randomBytes(16).toString("hex");
    db.run("INSERT INTO inviti (token, nome_gruppo, gruppo_id, note) VALUES (?, ?, ?, ?)",
      [token, nome_gruppo, gruppo_id || null, note || null]);

    const result = queryOne(db, "SELECT last_insert_rowid() as id");
    const invitoId = result?.id as number;

    for (const inv of invitati) {
      if (typeof inv === "string") {
        const trimmed = inv.trim();
        if (trimmed) {
          db.run("INSERT INTO invitati (invito_id, nome, genere) VALUES (?, ?, ?)",
            [invitoId, trimmed, "M"]);
        }
      } else {
        const trimmed = (inv.nome as string).trim();
        if (trimmed) {
          db.run("INSERT INTO invitati (invito_id, nome, genere) VALUES (?, ?, ?)",
            [invitoId, trimmed, inv.genere || "M"]);
        }
      }
    }

    await localSaveDb();
    return NextResponse.json({ id: invitoId, token });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const bodyText = await req.text();
  const proxied = await proxyToBackend(req, "inviti.php", bodyText);
  if (proxied) return proxied;

  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getLocalDb();
    const body = JSON.parse(bodyText);
    const { id, nome_gruppo, gruppo_id, invitati, note } = body;

    if (!id || !nome_gruppo || !invitati || !Array.isArray(invitati) || invitati.length === 0) {
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    db.run("UPDATE inviti SET nome_gruppo = ?, gruppo_id = ?, note = ? WHERE id = ?",
      [nome_gruppo, gruppo_id || null, note || null, id]);

    const existing = queryAll(db, "SELECT id, nome FROM invitati WHERE invito_id = ?", [id]);
    const existingIds = existing.map((e) => e.id as number);
    const newInvitati = invitati as { id?: number; nome: string; genere?: string }[];
    const keptIds: number[] = [];

    for (const inv of newInvitati) {
      const trimmed = inv.nome.trim();
      if (!trimmed) continue;
      if (inv.id) {
        db.run("UPDATE invitati SET nome = ?, genere = ? WHERE id = ? AND invito_id = ?",
          [trimmed, inv.genere || "M", inv.id, id]);
        keptIds.push(inv.id);
      } else {
        db.run("INSERT INTO invitati (invito_id, nome, genere) VALUES (?, ?, ?)",
          [id, trimmed, inv.genere || "M"]);
      }
    }

    for (const eid of existingIds) {
      if (!keptIds.includes(eid)) {
        db.run("DELETE FROM invitati WHERE id = ?", [eid]);
      }
    }

    await localSaveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const bodyText = await req.text();
  const proxied = await proxyToBackend(req, "inviti.php", bodyText);
  if (proxied) return proxied;

  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getLocalDb();
    const body = JSON.parse(bodyText);
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    db.run("DELETE FROM invitati WHERE invito_id = ?", [id]);
    db.run("DELETE FROM inviti WHERE id = ?", [id]);
    await localSaveDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
