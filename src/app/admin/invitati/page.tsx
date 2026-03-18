"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Invitato {
  id: number;
  nome: string;
  confermato: number | null;
  confirmed_at: string | null;
  nome_gruppo: string;
  gruppo: string | null;
}

type Filter = "tutti" | "confermati" | "rifiutati" | "attesa";

export default function AdminInvitatiPage() {
  const [invitati, setInvitati] = useState<Invitato[]>([]);
  const [filter, setFilter] = useState<Filter>("tutti");

  useEffect(() => {
    fetch("/api/inviti?invitati=1", {
      headers: { Authorization: "Bearer admin" },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setInvitati(data);
      })
      .catch(() => {});
  }, []);

  const filtered = invitati
    .filter((inv) => {
      if (filter === "confermati") return inv.confermato === 1;
      if (filter === "rifiutati") return inv.confermato === 0;
      if (filter === "attesa") return inv.confermato === null;
      return true;
    })
    .sort((a, b) => {
      if (filter === "confermati" || filter === "rifiutati") {
        const dateA = a.confirmed_at ? new Date(a.confirmed_at).getTime() : Infinity;
        const dateB = b.confirmed_at ? new Date(b.confirmed_at).getTime() : Infinity;
        return dateA - dateB;
      }
      return 0;
    });

  const counts = {
    tutti: invitati.length,
    confermati: invitati.filter((i) => i.confermato === 1).length,
    rifiutati: invitati.filter((i) => i.confermato === 0).length,
    attesa: invitati.filter((i) => i.confermato === null).length,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "tutti", label: "Tutti" },
    { key: "confermati", label: "Confermati" },
    { key: "rifiutati", label: "Non vengono" },
    { key: "attesa", label: "In attesa" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/admin"
        className="text-sm text-grigio hover:underline"
      >
        ← Dashboard
      </Link>

      <h1 className="mt-4 font-heading text-4xl text-marrone">
        Lista Invitati
      </h1>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === f.key
                ? "bg-marrone text-white"
                : "bg-white text-grigio"
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-beige text-left text-sm text-grigio">
              <th className="w-12 px-4 py-4 text-center font-medium">#</th>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Gruppo</th>
              <th className="px-6 py-4 font-medium">Stato</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, idx) => (
              <tr key={inv.id} className="border-b border-beige last:border-0">
                <td className="w-12 px-4 py-4 text-center text-sm text-grigio">{idx + 1}</td>
                <td className="px-6 py-4 font-semibold">{inv.nome}</td>
                <td className="px-6 py-4 text-sm text-grigio">
                  {inv.gruppo || "-"}
                </td>
                <td className="px-6 py-4">
                  <Badge confermato={inv.confermato} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-grigio">
                  Nessun invitato trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({ confermato }: { confermato: number | null }) {
  if (confermato === 1)
    return (
      <span className="rounded-full bg-verde/10 px-3 py-1 text-xs font-medium text-verde">
        Confermato
      </span>
    );
  if (confermato === 0)
    return (
      <span className="rounded-full bg-rosa/10 px-3 py-1 text-xs font-medium text-rosa">
        Non viene
      </span>
    );
  return (
    <span className="rounded-full bg-beige px-3 py-1 text-xs font-medium text-grigio">
      In attesa
    </span>
  );
}
