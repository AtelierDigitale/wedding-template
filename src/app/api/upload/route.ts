import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/local-db";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const foto = formData.get("foto") as File | null;
    const nomeAutore = formData.get("nome_autore") as string | null;
    const commento = formData.get("commento") as string | null;

    if (!foto) {
      return NextResponse.json({ error: "Foto mancante" }, { status: 400 });
    }

    const ext = foto.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}_${uuidv4()}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "foto");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await foto.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const db = await getDb();
    db.run(
      "INSERT INTO foto (filename, nome_autore, commento) VALUES (?, ?, ?)",
      [filename, nomeAutore || null, commento || null]
    );
    saveDb();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
