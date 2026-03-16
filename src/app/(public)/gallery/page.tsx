"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/Lightbox";

interface Foto {
  id: number;
  url: string;
  nome_autore: string | null;
  commento: string | null;
  uploaded_at: string;
}

export default function GalleryPage() {
  const [foto, setFoto] = useState<Foto[]>([]);
  const [selected, setSelected] = useState<Foto | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then(setFoto);
  }, []);

  if (foto.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="font-heading text-4xl text-marrone">Gallery</h1>
        <p className="mt-2 text-grigio">
          Le foto del nostro giorno speciale, scattate da voi!
        </p>
        <div className="mt-16">
          <p className="text-6xl">📷</p>
          <p className="mt-4 text-grigio">
            Ancora nessuna foto. Il giorno del matrimonio potrai caricare le
            tue!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-center font-heading text-4xl text-marrone">
        Gallery
      </h1>
      <p className="mt-2 text-center text-grigio">
        Le foto del nostro giorno speciale, scattate da voi!
      </p>

      <div className="mt-8 columns-2 gap-4 md:columns-3">
        {foto.map((f) => (
          <div
            key={f.id}
            className="mb-4 cursor-pointer break-inside-avoid overflow-hidden rounded-xl bg-white shadow-sm transition-transform hover:scale-[1.02]"
            onClick={() => setSelected(f)}
          >
            <Image
              src={f.url}
              alt={f.commento || "Foto matrimonio"}
              width={400}
              height={300}
              unoptimized
              className="w-full object-cover"
            />
            {(f.nome_autore || f.commento) && (
              <div className="p-3">
                {f.nome_autore && (
                  <p className="text-[10px] font-semibold text-verde">
                    {f.nome_autore}
                  </p>
                )}
                {f.commento && (
                  <p className="text-[10px] text-grigio">{f.commento}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <Lightbox
          src={selected.url}
          nomeAutore={selected.nome_autore}
          commento={selected.commento}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
