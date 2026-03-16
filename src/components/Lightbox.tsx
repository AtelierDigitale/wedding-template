"use client";

interface LightboxProps {
  src: string;
  nomeAutore?: string | null;
  commento?: string | null;
  onClose: () => void;
}

export default function Lightbox({
  src,
  nomeAutore,
  commento,
  onClose,
}: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl text-testo shadow-md"
        >
          ×
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Foto"
          className="max-h-[80vh] rounded-xl object-contain"
        />
        {(nomeAutore || commento) && (
          <div className="rounded-b-xl bg-white p-4">
            {nomeAutore && (
              <p className="text-xs font-semibold text-verde">{nomeAutore}</p>
            )}
            {commento && (
              <p className="mt-1 text-xs text-grigio">{commento}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
