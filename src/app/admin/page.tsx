"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface GruppoStats {
  id: number;
  nome: string;
  totale_inviti: number;
  totale_invitati: number;
  confermati: number;
  rifiutati: number;
  in_attesa: number;
}

interface Stats {
  totale_inviti: number;
  totale_invitati: number;
  confermati: number;
  rifiutati: number;
  in_attesa: number;
  per_gruppo: GruppoStats[];
  senza_gruppo: {
    totale_inviti: number;
    totale_invitati: number;
    confermati: number;
    rifiutati: number;
    in_attesa: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/inviti?stats=1", {
      headers: { Authorization: "Bearer admin" },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Fetch failed");
        return r.json();
      })
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-4xl text-marrone">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inviti?new=1"
            className="rounded-full bg-marrone px-5 py-2 text-sm text-white hover:opacity-90"
          >
            + Nuovo Invito
          </Link>
          <Link href="/" className="text-sm text-grigio hover:underline">
            Vai al sito
          </Link>
        </div>
      </div>

      {/* Stat boxes totali */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBox
          label="Inviti creati"
          value={stats?.totale_inviti ?? "-"}
          color="text-marrone"
        />
        <StatBox
          label="Confermati"
          value={stats?.confermati ?? "-"}
          color="text-verde"
        />
        <StatBox
          label="Non vengono"
          value={stats?.rifiutati ?? "-"}
          color="text-rosa"
        />
        <StatBox
          label="In attesa"
          value={stats?.in_attesa ?? "-"}
          color="text-grigio"
        />
      </div>

      {/* Navigation boxes */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/inviti"
          className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="font-heading text-xl text-marrone">
            Gestione Inviti
          </h2>
          <p className="mt-1 text-sm text-grigio">
            Crea, visualizza e gestisci gli inviti
          </p>
        </Link>

        <Link
          href="/admin/invitati"
          className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="font-heading text-xl text-marrone">Lista Invitati</h2>
          <p className="mt-1 text-sm text-grigio">
            Vedi lo stato delle conferme
          </p>
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl text-marrone">
            QR Code Gallery
          </h2>
          <p className="mt-1 text-sm text-grigio">
            Per la pagina upload foto
          </p>
          <QrUrl />
        </div>
      </div>

      {/* Stats per gruppo */}
      {stats?.per_gruppo && stats.per_gruppo.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-2xl text-marrone">Per gruppo</h2>
          <div className="mt-4 space-y-3">
            {stats.per_gruppo.map((g) => (
              <div key={g.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="font-semibold text-marrone">{g.nome}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="text-grigio">{g.totale_inviti} inviti · {g.totale_invitati} persone</span>
                  <span className="text-verde">{g.confermati} confermati</span>
                  <span className="text-rosa">{g.rifiutati} rifiutati</span>
                  <span className="text-grigio">{g.in_attesa} in attesa</span>
                </div>
              </div>
            ))}
            {stats.senza_gruppo && (stats.senza_gruppo.totale_inviti as number) > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="font-semibold text-grigio">Senza gruppo</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <span className="text-grigio">{stats.senza_gruppo.totale_inviti} inviti · {stats.senza_gruppo.totale_invitati} persone</span>
                  <span className="text-verde">{stats.senza_gruppo.confermati} confermati</span>
                  <span className="text-rosa">{stats.senza_gruppo.rifiutati} rifiutati</span>
                  <span className="text-grigio">{stats.senza_gruppo.in_attesa} in attesa</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QrUrl() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}/upload`);
  }, []);
  return (
    <p className="mt-3 break-all rounded-lg bg-beige p-2 text-xs text-testo">
      {url || "/upload"}
    </p>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-grigio">{label}</p>
    </div>
  );
}
