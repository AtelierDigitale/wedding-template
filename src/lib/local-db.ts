import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

let db: SqlJsDatabase | null = null;
let initPromise: Promise<SqlJsDatabase> | null = null;

const DB_PATH = path.join(process.cwd(), "dev.sqlite");

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb(): Promise<SqlJsDatabase> {
  const wasmPath = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  const wasmBinary = fs.readFileSync(wasmPath);
  const SQL = await initSqlJs({ wasmBinary });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS gruppi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS inviti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    nome_gruppo TEXT NOT NULL,
    gruppo_id INTEGER DEFAULT NULL,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (gruppo_id) REFERENCES gruppi(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS invitati (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invito_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    genere TEXT DEFAULT 'M',
    confermato INTEGER DEFAULT NULL,
    confirmed_at TEXT DEFAULT NULL,
    FOREIGN KEY (invito_id) REFERENCES inviti(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS foto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    nome_autore TEXT DEFAULT NULL,
    commento TEXT,
    uploaded_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run("PRAGMA foreign_keys = ON");
  saveDb();
  return db;
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  if (!initPromise) {
    initPromise = initDb();
  }
  return initPromise;
}

export { saveDb };
