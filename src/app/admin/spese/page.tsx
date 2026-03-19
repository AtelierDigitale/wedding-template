"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminGuard from "@/components/AdminGuard";

interface Spesa {
  id: number;
  categoria_id: number | null;
  preventivo_id: number | null;
  descrizione: string;
  importo: number;
  stato: "da_pagare" | "acconto" | "saldato";
  nota: string | null;
  manuale: number;
  categoria_nome: string | null;
}

interface Totali {
  totale: number;
  saldato: number;
  acconto: number;
  da_pagare: number;
}

const apiHeaders = { Authorization: "Bearer admin" };
const statiLabels: Record<string, { label: string; color: string }> = {
  da_pagare: { label: "Da pagare", color: "bg-rosa/10 text-rosa" },
  acconto: { label: "Acconto", color: "bg-terracotta/10 text-terracotta" },
  saldato: { label: "Saldato", color: "bg-verde/10 text-verde" },
};

export default function SpesePage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruolo = (session?.user as any)?.ruolo as string | undefined;

  const [spese, setSpese] = useState<Spesa[]>([]);
  const [totali, setTotali] = useState<Totali>({ totale: 0, saldato: 0, acconto: 0, da_pagare: 0 });
  const [showForm, setShowForm] = useState(false);
  const [descrizione, setDescrizione] = useState("");
  const [importo, setImporto] = useState("");
  const [nota, setNota] = useState("");

  function loadSpese() {
    fetch("/api/spese", { headers: apiHeaders })
      .then((r) => r.ok ? r.json() : { spese: [], totali: { totale: 0, saldato: 0, acconto: 0, da_pagare: 0 } })
      .then((data) => {
        setSpese(data.spese || []);
        setTotali(data.totali || { totale: 0, saldato: 0, acconto: 0, da_pagare: 0 });
      })
      .catch(() => {});
  }

  useEffect(() => { loadSpese(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!descrizione.trim() || !importo) return;

    await fetch("/api/spese", {
      method: "POST",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        descrizione: descrizione.trim(),
        importo: parseFloat(importo),
        nota: nota.trim() || null,
      }),
    });

    setDescrizione("");
    setImporto("");
    setNota("");
    setShowForm(false);
    loadSpese();
  }

  async function handleUpdateStato(id: number, stato: string) {
    await fetch("/api/spese", {
      method: "PUT",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id, stato }),
    });
    loadSpese();
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminare questa spesa?")) return;
    await fetch("/api/spese", {
      method: "DELETE",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadSpese();
  }

  const formatEuro = (n: number) =>
    Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <AdminGuard allowedRoles={["sposi", "planner"]}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-marrone">Spese</h1>
          {ruolo === "sposi" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-marrone px-5 py-2 text-sm text-white active:opacity-80"
            >
              {showForm ? "Chiudi" : "+ Spesa manuale"}
            </button>
          )}
        </div>

        {/* Totali */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-marrone md:text-2xl">€{formatEuro(totali.totale)}</p>
            <p className="text-xs text-grigio">Totale</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-rosa md:text-2xl">€{formatEuro(totali.da_pagare)}</p>
            <p className="text-xs text-grigio">Da pagare</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-terracotta md:text-2xl">€{formatEuro(totali.acconto)}</p>
            <p className="text-xs text-grigio">Acconti</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-verde md:text-2xl">€{formatEuro(totali.saldato)}</p>
            <p className="text-xs text-grigio">Saldato</p>
          </div>
        </div>

        {/* Form spesa manuale */}
        {showForm && ruolo === "sposi" && (
          <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-heading text-lg text-marrone">Nuova spesa manuale</h3>
            <input
              type="text"
              placeholder="Descrizione *"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Importo (€) *"
              value={importo}
              onChange={(e) => setImporto(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Nota (facoltativo)"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
            <button type="submit" className="rounded-full bg-marrone px-8 py-3 text-white active:opacity-80">
              Aggiungi
            </button>
          </form>
        )}

        {/* Lista spese */}
        <div className="mt-6 space-y-3">
          {spese.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl">💰</p>
              <p className="mt-3 text-grigio">Nessuna spesa registrata.</p>
            </div>
          ) : (
            spese.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-testo">{s.descrizione}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-grigio">
                      {s.categoria_nome && <span>{s.categoria_nome}</span>}
                      {s.manuale ? (
                        <span className="rounded-full bg-beige px-2 py-0.5">Manuale</span>
                      ) : (
                        <span className="rounded-full bg-beige px-2 py-0.5">Da preventivo</span>
                      )}
                    </div>
                    {s.nota && <p className="mt-1 text-xs italic text-grigio">{s.nota}</p>}
                  </div>
                  <p className="ml-4 text-lg font-bold text-marrone">€{formatEuro(s.importo)}</p>
                </div>

                {/* Stato + azioni */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(["da_pagare", "acconto", "saldato"] as const).map((stato) => (
                    <button
                      key={stato}
                      onClick={() => ruolo === "sposi" && handleUpdateStato(s.id, stato)}
                      disabled={ruolo !== "sposi"}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        s.stato === stato
                          ? statiLabels[stato].color
                          : "bg-beige/50 text-grigio/50"
                      } ${ruolo === "sposi" ? "active:opacity-80" : ""}`}
                    >
                      {statiLabels[stato].label}
                    </button>
                  ))}

                  {ruolo === "sposi" && s.manuale === 1 && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="ml-auto rounded-full px-3 py-1 text-xs text-rosa active:bg-rosa/10"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
