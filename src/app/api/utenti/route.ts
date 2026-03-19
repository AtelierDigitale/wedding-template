import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-fetch";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === "Bearer admin";
}

export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/utenti.php`, {
      method: "GET",
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
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
    const { getDb } = await import("@/lib/local-db");
    const db = await getDb();
    const stmt = db.prepare(
      "SELECT id, username, ruolo, nome, created_at FROM utenti ORDER BY created_at"
    );
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row: Record<string, unknown> = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      rows.push(row);
    }
    stmt.free();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";
  const bodyText = await req.text();

  if (apiUrl && apiUrl !== "local") {
    const qs = action ? `?action=${action}` : "";
    const res = await proxyFetch(`${apiUrl}/api/utenti.php${qs}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: bodyText,
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Local: login action
  if (action === "login") {
    try {
      const body = JSON.parse(bodyText);
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json(
          { error: "Credenziali mancanti" },
          { status: 400 }
        );
      }

      const { getDb } = await import("@/lib/local-db");
      const db = await getDb();
      const stmt = db.prepare(
        "SELECT id, username, password_hash, ruolo, nome FROM utenti WHERE username = ?"
      );
      stmt.bind([username]);

      if (!stmt.step()) {
        stmt.free();
        return NextResponse.json(
          { error: "Credenziali non valide" },
          { status: 401 }
        );
      }

      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const user: Record<string, unknown> = {};
      columns.forEach((col, i) => {
        user[col] = values[i];
      });
      stmt.free();

      // For local dev, compare plain text (bcrypt not available in browser)
      // In production, PHP uses password_verify
      const bcrypt = await import("bcryptjs");
      const valid = await bcrypt.compare(
        password,
        user.password_hash as string
      );
      if (!valid) {
        return NextResponse.json(
          { error: "Credenziali non valide" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        id: user.id,
        username: user.username,
        ruolo: user.ruolo,
        nome: user.nome,
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Local: change password
  if (action === "change-password") {
    try {
      const body = JSON.parse(bodyText);
      const { username, old_password, new_password } = body;
      if (!username || !old_password || !new_password) {
        return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
      }
      if (new_password.length < 6) {
        return NextResponse.json(
          { error: "La nuova password deve avere almeno 6 caratteri" },
          { status: 400 }
        );
      }

      const { getDb, saveDb } = await import("@/lib/local-db");
      const bcrypt = await import("bcryptjs");
      const db = await getDb();

      const stmt = db.prepare(
        "SELECT id, password_hash FROM utenti WHERE username = ?"
      );
      stmt.bind([username]);
      if (!stmt.step()) {
        stmt.free();
        return NextResponse.json(
          { error: "Utente non trovato" },
          { status: 404 }
        );
      }
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const user: Record<string, unknown> = {};
      cols.forEach((col, i) => { user[col] = vals[i]; });
      stmt.free();

      const valid = await bcrypt.compare(old_password, user.password_hash as string);
      if (!valid) {
        return NextResponse.json(
          { error: "Password attuale non corretta" },
          { status: 401 }
        );
      }

      const newHash = await bcrypt.hash(new_password, 10);
      db.run("UPDATE utenti SET password_hash = ? WHERE id = ?", [newHash, user.id as number]);
      saveDb();

      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }

  // Local: create user
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = JSON.parse(bodyText);
    const { username, password, ruolo, nome } = body;
    if (
      !username ||
      !password ||
      !["sposi", "planner"].includes(ruolo)
    ) {
      return NextResponse.json(
        { error: "Dati mancanti o ruolo non valido" },
        { status: 400 }
      );
    }

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash(password, 10);

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run(
      "INSERT INTO utenti (username, password_hash, ruolo, nome) VALUES (?, ?, ?, ?)",
      [username, hash, ruolo, nome || null]
    );
    saveDb();

    const stmt = db.prepare("SELECT last_insert_rowid() as id");
    stmt.step();
    const id = stmt.get()[0];
    stmt.free();

    return NextResponse.json({ id, username, ruolo, nome });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const bodyText = await req.text();

  if (apiUrl && apiUrl !== "local") {
    const res = await proxyFetch(`${apiUrl}/api/utenti.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
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
    const body = JSON.parse(bodyText);
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run("DELETE FROM utenti WHERE id = ?", [id]);
    saveDb();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
