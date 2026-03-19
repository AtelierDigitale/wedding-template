"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminGuard from "@/components/AdminGuard";

interface Categoria {
  id: number;
  nome: string;
  icona: string | null;
  ordine: number;
  totale_preventivi: number;
  preventivo_scelto: number;
  importo_scelto: number;
}

const headers = { Authorization: "Bearer admin" };

export default function PreventiviPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruolo = (session?.user as any)?.ruolo as string | undefined;

  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");

  function loadCategorie() {
    fetch("/api/categorie", { headers })
      .then((r) => r.ok ? r.json() : [])
      .then(setCategorie)
      .catch(() => {});
  }

  useEffect(() => { loadCategorie(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    await fetch("/api/categorie", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome.trim() }),
    });

    setNome("");
    setShowForm(false);
    loadCategorie();
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminare questa categoria e tutti i suoi preventivi?")) return;
    await fetch("/api/categorie", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadCategorie();
  }

  return (
    <AdminGuard allowedRoles={["sposi", "planner"]}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-marrone">Preventivi</h1>
          {(
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-marrone px-5 py-2 text-sm text-white active:opacity-80"
            >
              {showForm ? "Chiudi" : "+ Categoria"}
            </button>
          )}
        </div>

        {/* Form nuova categoria */}
        {showForm && (
          <form onSubmit={handleCreate} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Nome categoria (es. Fiori, Fotografo...)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
              autoFocus
            />
            <button
              type="submit"
              className="rounded-full bg-marrone px-6 py-3 text-white active:opacity-80"
            >
              Crea
            </button>
          </form>
        )}

        {/* Lista categorie */}
        <div className="mt-6 space-y-3">
          {categorie.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-5xl">📋</p>
              <p className="mt-4 text-grigio">
                {"Nessuna categoria. Crea la prima!"}
              </p>
            </div>
          ) : (
            categorie.map((cat) => (
              <Link
                key={cat.id}
                href={`/admin/preventivi/${cat.id}`}
                className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{cat.icona || "📁"}</span>
                  <div>
                    <h2 className="font-semibold text-testo">{cat.nome}</h2>
                    <p className="text-sm text-grigio">
                      {cat.totale_preventivi} preventiv{cat.totale_preventivi === 1 ? "o" : "i"}
                      {cat.preventivo_scelto > 0 && (
                        <span className="ml-2 text-verde">
                          · Scelto: €{Number(cat.importo_scelto).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {cat.totale_preventivi > 0 && cat.preventivo_scelto === 0 && (
                        <span className="ml-2 text-terracotta">· Da scegliere</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(cat.id); }}
                      className="rounded-full px-3 py-1 text-sm text-rosa active:bg-rosa/10"
                    >
                      ×
                    </button>
                  )}
                  <span className="text-grigio">›</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
