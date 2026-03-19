"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

interface Gruppo {
  id: number;
  nome: string;
}

interface Invito {
  id: number;
  token: string;
  nome_gruppo: string;
  gruppo_id: number | null;
  gruppo_nome: string | null;
  note: string | null;
  created_at: string;
  totale_invitati: number;
  confermati: number;
  rifiutati: number;
  in_attesa: number;
}

interface InvitatoDetail {
  id: number;
  nome: string;
  genere: string;
  confermato: number | null;
}

export default function AdminInvitiPage() {
  return (
    <AdminGuard>
      <Suspense>
        <AdminInvitiContent />
      </Suspense>
    </AdminGuard>
  );
}

function AdminInvitiContent() {
  const searchParams = useSearchParams();
  const [inviti, setInviti] = useState<Invito[]>([]);
  const [gruppi, setGruppi] = useState<Gruppo[]>([]);
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");
  const [nomeGruppo, setNomeGruppo] = useState("");
  const [gruppoId, setGruppoId] = useState<number | "">("");
  const [nomiList, setNomiList] = useState<{ nome: string; genere: string }[]>([
    { nome: "", genere: "M" },
  ]);
  const [note, setNote] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Gestione gruppi
  const [showGruppiForm, setShowGruppiForm] = useState(false);
  const [newGruppoNome, setNewGruppoNome] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNomeGruppo, setEditNomeGruppo] = useState("");
  const [editGruppoId, setEditGruppoId] = useState<number | "">("");
  const [editInvitati, setEditInvitati] = useState<InvitatoDetail[]>([]);
  const [editNewNomi, setEditNewNomi] = useState<{ nome: string; genere: string }[]>([]);
  const [editNote, setEditNote] = useState("");

  const headers = { Authorization: "Bearer admin" };

  function loadInviti() {
    fetch("/api/inviti", { headers })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setInviti)
      .catch(() => {});
  }

  function loadGruppi() {
    fetch("/api/gruppi", { headers })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setGruppi(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadInviti();
    loadGruppi();
  }, []);

async function handleCreateGruppo(e: React.FormEvent) {
    e.preventDefault();
    if (!newGruppoNome.trim()) return;

    await fetch("/api/gruppi", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ nome: newGruppoNome.trim() }),
    });

    setNewGruppoNome("");
    loadGruppi();
  }

  async function handleDeleteGruppo(id: number) {
    if (!confirm("Sei sicuro? Gli inviti in questo gruppo resteranno senza gruppo.")) return;

    await fetch("/api/gruppi", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadGruppi();
    loadInviti();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const invitati = nomiList.filter((inv) => inv.nome.trim());
    if (!nomeGruppo || invitati.length === 0) return;

    await fetch("/api/inviti", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_gruppo: nomeGruppo,
        gruppo_id: gruppoId || null,
        invitati,
        note,
      }),
    });

    setNomeGruppo("");
    setGruppoId("");
    setNomiList([{ nome: "", genere: "M" }]);
    setNote("");
    setShowForm(false);
    loadInviti();
  }

  async function handleDelete(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questo invito?")) return;

    await fetch("/api/inviti", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadInviti();
  }

  function handleCopy(token: string, id: number) {
    const url = `${window.location.origin}/invito/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function startEdit(id: number) {
    const res = await fetch(`/api/inviti?id=${id}`, { headers });
    if (!res.ok) return;
    const data = await res.json();
    setEditingId(id);
    setEditNomeGruppo(data.invito.nome_gruppo);
    setEditGruppoId(data.invito.gruppo_id || "");
    setEditNote(data.invito.note || "");
    setEditInvitati(data.invitati);
    setEditNewNomi([]);
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditNomeGruppo("");
    setEditGruppoId("");
    setEditInvitati([]);
    setEditNewNomi([]);
    setEditNote("");
  }

  function updateInvitato(idx: number, field: string, value: string) {
    setEditInvitati((prev) =>
      prev.map((inv, i) => (i === idx ? { ...inv, [field]: value } : inv))
    );
  }

  function removeInvitato(idx: number) {
    setEditInvitati((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editNomeGruppo) return;

    const existingInvitati = editInvitati
      .filter((inv) => inv.nome.trim())
      .map((inv) => ({ id: inv.id, nome: inv.nome.trim(), genere: inv.genere }));

    const newInvitati = editNewNomi.filter((inv) => inv.nome.trim());

    const allInvitati = [...existingInvitati, ...newInvitati];
    if (allInvitati.length === 0) return;

    await fetch("/api/inviti", {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        nome_gruppo: editNomeGruppo,
        gruppo_id: editGruppoId || null,
        invitati: allInvitati,
        note: editNote,
      }),
    });

    cancelEdit();
    loadInviti();
  }

  // Group inviti by gruppo for display
  const grouped = inviti.reduce<Record<string, Invito[]>>((acc, inv) => {
    const key = inv.gruppo_nome || "Senza gruppo";
    if (!acc[key]) acc[key] = [];
    acc[key].push(inv);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-sm text-grigio hover:underline">
        ← Dashboard
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-heading text-4xl text-marrone">Gestione Inviti</h1>
        <div className="flex gap-2">
          {!editingId && (
            <>
              <button
                onClick={() => { setShowGruppiForm(!showGruppiForm); setShowForm(false); }}
                className="rounded-full bg-bosco px-5 py-2 text-sm text-white hover:opacity-90"
              >
                {showGruppiForm ? "Chiudi" : "Gruppi"}
              </button>
              <button
                onClick={() => { setShowForm(!showForm); setShowGruppiForm(false); }}
                className="rounded-full bg-marrone px-6 py-2 text-sm text-white hover:opacity-90"
              >
                {showForm ? "Chiudi" : "+ Nuovo Invito"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Gestione Gruppi */}
      {showGruppiForm && !editingId && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl text-marrone">Gestione Gruppi</h2>

          <form onSubmit={handleCreateGruppo} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Nome nuovo gruppo (es. Famiglia Sposo)"
              value={newGruppoNome}
              onChange={(e) => setNewGruppoNome(e.target.value)}
              className="flex-1 rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <button
              type="submit"
              className="rounded-full bg-bosco px-6 py-3 text-white hover:opacity-90"
            >
              Crea
            </button>
          </form>

          {gruppi.length > 0 ? (
            <div className="mt-4 space-y-2">
              {gruppi.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-xl bg-beige px-4 py-3">
                  <span className="font-medium text-testo">{g.nome}</span>
                  <button
                    onClick={() => handleDeleteGruppo(g.id)}
                    className="rounded-full px-3 py-1 text-sm text-rosa hover:bg-rosa/10"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-grigio">Nessun gruppo creato.</p>
          )}
        </div>
      )}

      {/* Form creazione */}
      {showForm && !editingId && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome invito (es. Famiglia Rossi)"
              value={nomeGruppo}
              onChange={(e) => setNomeGruppo(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <select
              value={gruppoId}
              onChange={(e) => setGruppoId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            >
              <option value="">Nessun gruppo</option>
              {gruppi.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>
            <div>
              <p className="mb-2 text-sm font-medium text-grigio">Invitati</p>
              {nomiList.map((inv, idx) => (
                <div key={idx} className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome e cognome"
                    value={inv.nome}
                    onChange={(e) =>
                      setNomiList((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, nome: e.target.value } : item
                        )
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setNomiList((prev) => [
                          ...prev.slice(0, idx + 1),
                          { nome: "", genere: "M" },
                          ...prev.slice(idx + 1),
                        ]);
                        setTimeout(() => {
                          const inputs = document.querySelectorAll<HTMLInputElement>(
                            '[data-nomi-input]'
                          );
                          inputs[idx + 1]?.focus();
                        }, 0);
                      }
                    }}
                    data-nomi-input
                    className="flex-1 rounded-xl border border-rosa/30 bg-beige px-4 py-2 focus:border-verde focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-sm text-grigio">
                    <input
                      type="checkbox"
                      checked={inv.genere === "F"}
                      onChange={(e) =>
                        setNomiList((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, genere: e.target.checked ? "F" : "M" }
                              : item
                          )
                        )
                      }
                      className="h-4 w-4 rounded accent-rosa"
                    />
                    Donna
                  </label>
                  {nomiList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setNomiList((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="rounded-full px-2 py-1 text-sm text-rosa hover:bg-rosa/10"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setNomiList((prev) => [...prev, { nome: "", genere: "M" }])
                }
                className="mt-1 rounded-full bg-verde/10 px-4 py-1.5 text-sm text-verde hover:bg-verde/20"
              >
                + Aggiungi invitato
              </button>
            </div>
            <input
              type="text"
              placeholder="Note (facoltativo)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-marrone px-8 py-3 text-white hover:opacity-90"
            >
              Crea Invito
            </button>
          </div>
        </form>
      )}

      {/* Form modifica */}
      {editingId && (
        <form
          onSubmit={handleSaveEdit}
          className="mt-6 rounded-2xl border-2 border-marrone/20 bg-white p-6 shadow-sm"
        >
          <h2 className="font-heading text-xl text-marrone">Modifica Invito</h2>
          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Nome invito"
              value={editNomeGruppo}
              onChange={(e) => setEditNomeGruppo(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
              required
            />
            <select
              value={editGruppoId}
              onChange={(e) => setEditGruppoId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            >
              <option value="">Nessun gruppo</option>
              {gruppi.map((g) => (
                <option key={g.id} value={g.id}>{g.nome}</option>
              ))}
            </select>

            <div>
              <p className="mb-2 text-sm font-medium text-grigio">
                Invitati esistenti
              </p>
              {editInvitati.map((inv, idx) => (
                <div key={inv.id} className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={inv.nome}
                    onChange={(e) => updateInvitato(idx, "nome", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setEditNewNomi((prev) =>
                          prev.length === 0
                            ? [{ nome: "", genere: "M" }]
                            : prev
                        );
                        if (editNewNomi.length === 0) {
                          setEditNewNomi([{ nome: "", genere: "M" }]);
                        }
                        setTimeout(() => {
                          const inputs = document.querySelectorAll<HTMLInputElement>(
                            '[data-edit-new-input]'
                          );
                          const last = inputs[inputs.length - 1] || document.querySelectorAll<HTMLInputElement>('[data-edit-existing-input]')[idx + 1];
                          last?.focus();
                        }, 0);
                      }
                    }}
                    data-edit-existing-input
                    className="flex-1 rounded-xl border border-rosa/30 bg-beige px-4 py-2 focus:border-verde focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-sm text-grigio">
                    <input
                      type="checkbox"
                      checked={inv.genere === "F"}
                      onChange={(e) =>
                        updateInvitato(idx, "genere", e.target.checked ? "F" : "M")
                      }
                      className="h-4 w-4 rounded accent-rosa"
                    />
                    Donna
                  </label>
                  {inv.confermato !== null && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        inv.confermato === 1
                          ? "bg-verde/10 text-verde"
                          : "bg-rosa/10 text-rosa"
                      }`}
                    >
                      {inv.confermato === 1 ? "Conf." : "No"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeInvitato(idx)}
                    className="rounded-full px-3 py-1 text-sm text-rosa hover:bg-rosa/10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-grigio">
                Aggiungi nuovi invitati
              </p>
              {editNewNomi.map((inv, idx) => (
                <div key={idx} className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome e cognome"
                    value={inv.nome}
                    onChange={(e) =>
                      setEditNewNomi((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, nome: e.target.value } : item
                        )
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setEditNewNomi((prev) => [
                          ...prev.slice(0, idx + 1),
                          { nome: "", genere: "M" },
                          ...prev.slice(idx + 1),
                        ]);
                        setTimeout(() => {
                          const inputs = document.querySelectorAll<HTMLInputElement>(
                            '[data-edit-new-input]'
                          );
                          inputs[idx + 1]?.focus();
                        }, 0);
                      }
                    }}
                    data-edit-new-input
                    className="flex-1 rounded-xl border border-rosa/30 bg-beige px-4 py-2 focus:border-verde focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 text-sm text-grigio">
                    <input
                      type="checkbox"
                      checked={inv.genere === "F"}
                      onChange={(e) =>
                        setEditNewNomi((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, genere: e.target.checked ? "F" : "M" }
                              : item
                          )
                        )
                      }
                      className="h-4 w-4 rounded accent-rosa"
                    />
                    Donna
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditNewNomi((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="rounded-full px-2 py-1 text-sm text-rosa hover:bg-rosa/10"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setEditNewNomi((prev) => [...prev, { nome: "", genere: "M" }])
                }
                className="mt-1 rounded-full bg-verde/10 px-4 py-1.5 text-sm text-verde hover:bg-verde/20"
              >
                + Aggiungi invitato
              </button>
            </div>

            <input
              type="text"
              placeholder="Note (facoltativo)"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-full bg-beige px-6 py-3 text-grigio"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded-full bg-marrone px-8 py-3 text-white hover:opacity-90"
              >
                Salva Modifiche
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista inviti raggruppati */}
      <div className="mt-8 space-y-6">
        {inviti.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-6xl">💌</p>
            <p className="mt-4 text-grigio">
              Nessun invito creato. Inizia creando il primo!
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([gruppoName, items]) => (
            <div key={gruppoName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-grigio">
                {gruppoName}
              </h2>
              <div className="space-y-4">
                {items.map((inv) => (
                  <div
                    key={inv.id}
                    className={`rounded-2xl bg-white p-6 shadow-sm ${editingId === inv.id ? "ring-2 ring-marrone/30" : ""}`}
                  >
                    <p className="text-lg font-semibold text-marrone">
                      {inv.nome_gruppo}
                    </p>
                    <p className="mt-1 text-sm text-grigio">
                      {inv.totale_invitati} invitati · {inv.confermati} confermati ·{" "}
                      {inv.rifiutati} rifiutati · {inv.in_attesa} in attesa
                    </p>
                    {inv.note && (
                      <p className="mt-1 text-sm italic text-grigio">{inv.note}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCopy(inv.token, inv.id)}
                        className="rounded-full bg-verde/10 px-4 py-2 text-sm text-verde hover:bg-verde/20"
                      >
                        {copiedId === inv.id ? "Copiato!" : "Copia link"}
                      </button>
                      <button
                        onClick={() => startEdit(inv.id)}
                        className="rounded-full bg-marrone/10 px-4 py-2 text-sm text-marrone hover:bg-marrone/20"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="rounded-full bg-rosa/10 px-4 py-2 text-sm text-rosa hover:bg-rosa/20"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
