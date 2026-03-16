"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Step = "select" | "preview" | "success";

export default function UploadPage() {
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [nome, setNome] = useState("");
  const [commento, setCommento] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("preview");
    setError("");
  }

  function handleCancel() {
    setFile(null);
    setPreview("");
    setNome("");
    setCommento("");
    setStep("select");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("foto", file);
    if (nome.trim()) formData.append("nome_autore", nome.trim());
    if (commento.trim()) formData.append("commento", commento.trim());

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      setStep("success");
    } catch {
      setError("Errore nel caricamento. Riprova!");
    } finally {
      setLoading(false);
    }
  }

  function handleAnother() {
    handleCancel();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-crema px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-heading text-3xl text-marrone">
          Condividi le tue foto!
        </h1>
        <p className="mt-2 text-lg text-grigio">
          <span className="font-heading">Marcella &amp; Francesco</span> · 29.08.2026
        </p>

        {step === "select" && (
          <div className="mt-10">
            <label className="inline-flex cursor-pointer flex-col items-center rounded-2xl bg-verde px-12 py-8 text-white hover:opacity-90">
              <span className="text-4xl">📷</span>
              <span className="mt-3 text-xl">Scegli una foto</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {step === "preview" && preview && (
          <div className="mt-8 space-y-4">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={320}
              unoptimized
              className="mx-auto max-h-80 rounded-xl object-cover"
            />
            <input
              type="text"
              placeholder="Il tuo nome (facoltativo)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
            <input
              type="text"
              placeholder="Un commento (facoltativo)"
              value={commento}
              onChange={(e) => setCommento(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-full bg-beige py-3 text-grigio"
              >
                Annulla
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] rounded-full bg-verde py-3 text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Invio..." : "Invia foto"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="mt-10">
            <p className="text-6xl">✨</p>
            <p className="mt-4 text-xl font-semibold text-verde">
              Foto caricata!
            </p>
            <p className="mt-2 text-grigio">
              Grazie per aver condiviso questo momento
            </p>
            <button
              onClick={handleAnother}
              className="mt-6 w-full rounded-full bg-verde py-3 text-white hover:opacity-90"
            >
              Carica un&apos;altra foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
