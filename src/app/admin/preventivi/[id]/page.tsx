"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

interface Preventivo {
  id: number;
  categoria_id: number;
  fornitore: string;
  descrizione: string | null;
  prezzo: number;
  note: string | null;
  scelto: number;
  created_by: number;
  created_by_nome: string | null;
  created_at: string;
  allegati: Allegato[];
}

interface Allegato {
  id: number;
  filename: string;
  original_name: string;
  tipo: string;
}

const apiHeaders = { Authorization: "Bearer admin" };

export default function CategoriaDettaglioPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAny = session?.user as any;
  const ruolo = userAny?.ruolo as string | undefined;
  const userId = userAny?.userId as string | undefined;

  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [categoriaNome, setCategoriaNome] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [fornitore, setFornitore] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [note, setNote] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);

  function loadPreventivi() {
    fetch(`/api/preventivi?categoria_id=${id}`, { headers: apiHeaders })
      .then((r) => r.ok ? r.json() : [])
      .then(setPreventivi)
      .catch(() => {});
  }

  function loadCategoria() {
    fetch("/api/categorie", { headers: apiHeaders })
      .then((r) => r.ok ? r.json() : [])
      .then((cats) => {
        const cat = cats.find((c: { id: number }) => c.id === Number(id));
        if (cat) setCategoriaNome(cat.nome);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadPreventivi();
    loadCategoria();
  }, [id]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!fornitore.trim() || !prezzo) return;

    await fetch("/api/preventivi", {
      method: "POST",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        categoria_id: Number(id),
        fornitore: fornitore.trim(),
        descrizione: descrizione.trim() || null,
        prezzo: parseFloat(prezzo),
        note: note.trim() || null,
        created_by: userId ? Number(userId) : null,
      }),
    });

    resetForm();
    loadPreventivi();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !fornitore.trim() || !prezzo) return;

    await fetch("/api/preventivi", {
      method: "PUT",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        fornitore: fornitore.trim(),
        descrizione: descrizione.trim() || null,
        prezzo: parseFloat(prezzo),
        note: note.trim() || null,
      }),
    });

    resetForm();
    loadPreventivi();
  }

  async function handleDelete(prevId: number) {
    if (!confirm("Eliminare questo preventivo?")) return;
    await fetch("/api/preventivi", {
      method: "DELETE",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id: prevId }),
    });
    loadPreventivi();
  }

  async function handleScegli(prevId: number) {
    await fetch("/api/preventivi", {
      method: "PUT",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id: prevId, action: "scegli" }),
    });
    loadPreventivi();
  }

  async function handleDescegli(prevId: number) {
    await fetch("/api/preventivi", {
      method: "PUT",
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ id: prevId, action: "descegli" }),
    });
    loadPreventivi();
  }

  function startEdit(prev: Preventivo) {
    setEditingId(prev.id);
    setFornitore(prev.fornitore);
    setDescrizione(prev.descrizione || "");
    setPrezzo(String(prev.prezzo));
    setNote(prev.note || "");
    setShowForm(true);
  }

  function resetForm() {
    setFornitore("");
    setDescrizione("");
    setPrezzo("");
    setNote("");
    setShowForm(false);
    setEditingId(null);
  }

  const formatEuro = (n: number) =>
    Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <AdminGuard allowedRoles={["sposi", "planner"]}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Link href="/admin/preventivi" className="text-sm text-grigio active:underline">
          ← Preventivi
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <h1 className="font-heading text-3xl text-marrone">{categoriaNome || "..."}</h1>
          <button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="rounded-full bg-marrone px-5 py-2 text-sm text-white active:opacity-80"
          >
            {showForm ? "Chiudi" : "+ Preventivo"}
          </button>
        </div>

        {/* Form crea/modifica preventivo */}
        {showForm && (
          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            className="mt-4 space-y-3 rounded-2xl bg-white p-5 shadow-sm"
          >
            <h3 className="font-heading text-lg text-marrone">
              {editingId ? "Modifica preventivo" : "Nuovo preventivo"}
            </h3>
            <input
              type="text"
              placeholder="Fornitore *"
              value={fornitore}
              onChange={(e) => setFornitore(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <textarea
              placeholder="Descrizione (cosa include il preventivo)"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Prezzo (€) *"
              value={prezzo}
              onChange={(e) => setPrezzo(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Note aggiuntive"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full bg-beige px-6 py-3 text-grigio"
                >
                  Annulla
                </button>
              )}
              <button
                type="submit"
                className="rounded-full bg-marrone px-8 py-3 text-white active:opacity-80"
              >
                {editingId ? "Salva" : "Aggiungi"}
              </button>
            </div>
          </form>
        )}

        {/* Lista preventivi */}
        <div className="mt-6 space-y-4">
          {preventivi.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl">📝</p>
              <p className="mt-3 text-grigio">
                {"Nessun preventivo. Aggiungine uno!"}
              </p>
            </div>
          ) : (
            preventivi.map((prev) => (
              <div
                key={prev.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ${
                  prev.scelto ? "ring-2 ring-verde" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-testo">{prev.fornitore}</h3>
                    {prev.created_by_nome && (
                      <p className="text-xs text-grigio">Aggiunto da {prev.created_by_nome}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-marrone">€{formatEuro(prev.prezzo)}</p>
                    {prev.scelto ? (
                      <span className="inline-block rounded-full bg-verde/10 px-3 py-0.5 text-xs font-medium text-verde">
                        Scelto ✓
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Descrizione */}
                {prev.descrizione && (
                  <p className="mt-3 text-sm text-grigio whitespace-pre-line">{prev.descrizione}</p>
                )}

                {/* Note */}
                {prev.note && (
                  <p className="mt-2 rounded-lg bg-beige px-3 py-2 text-sm italic text-grigio">
                    {prev.note}
                  </p>
                )}

                {/* Azioni */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Scegli/descegli — solo sposi */}
                  {ruolo === "sposi" && !prev.scelto && (
                    <button
                      onClick={() => handleScegli(prev.id)}
                      className="rounded-full bg-verde px-5 py-2 text-sm text-white active:opacity-80"
                    >
                      Scegli questo
                    </button>
                  )}
                  {ruolo === "sposi" && prev.scelto && (
                    <button
                      onClick={() => handleDescegli(prev.id)}
                      className="rounded-full bg-grigio/10 px-5 py-2 text-sm text-grigio active:opacity-80"
                    >
                      Annulla scelta
                    </button>
                  )}

                  {/* Modifica/elimina — tutti */}
                  <button
                    onClick={() => startEdit(prev)}
                    className="rounded-full bg-marrone/10 px-4 py-2 text-sm text-marrone active:opacity-80"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(prev.id)}
                    className="rounded-full bg-rosa/10 px-4 py-2 text-sm text-rosa active:opacity-80"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
