import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const proxied = await proxyToBackend(req, "upload.php");
  if (proxied) return proxied;

  try {
    const { v4: uuidv4 } = await import("uuid");
    const fs = await import("fs");
    const path = await import("path");

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

    const { getDb, saveDb } = await import("@/lib/local-db");
    const db = await getDb();
    db.run(
      "INSERT INTO foto (filename, nome_autore, commento) VALUES (?, ?, ?)",
      [filename, nomeAutore || null, commento || null]
    );
    saveDb();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
