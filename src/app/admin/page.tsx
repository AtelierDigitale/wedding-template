"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminGuard from "@/components/AdminGuard";

interface Stats {
  totale_inviti: number;
  totale_invitati: number;
  confermati: number;
  rifiutati: number;
  in_attesa: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruolo = (session?.user as any)?.ruolo as string | undefined;
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (ruolo === "sposi") {
      fetch("/api/inviti?stats=1", {
        headers: { Authorization: "Bearer admin" },
      })
        .then((r) => {
          if (!r.ok) throw new Error("Fetch failed");
          return r.json();
        })
        .then(setStats)
        .catch(() => {});
    }
  }, [ruolo]);

  return (
    <AdminGuard>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="font-heading text-3xl text-marrone md:text-4xl">Dashboard</h1>

        {/* Stats inviti — solo sposi */}
        {ruolo === "sposi" && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatBox label="Inviti" value={stats?.totale_inviti ?? "-"} color="text-marrone" />
            <StatBox label="Confermati" value={stats?.confermati ?? "-"} color="text-verde" />
            <StatBox label="Non vengono" value={stats?.rifiutati ?? "-"} color="text-rosa" />
            <StatBox label="In attesa" value={stats?.in_attesa ?? "-"} color="text-grigio" />
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link
            href="/admin/preventivi"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
          >
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="font-heading text-lg text-marrone">Preventivi</h2>
              <p className="text-sm text-grigio">
                {ruolo === "planner" ? "Gestisci i preventivi" : "Confronta e scegli"}
              </p>
            </div>
          </Link>

          <Link
            href="/admin/spese"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
          >
            <span className="text-3xl">💰</span>
            <div>
              <h2 className="font-heading text-lg text-marrone">Spese</h2>
              <p className="text-sm text-grigio">Riepilogo budget</p>
            </div>
          </Link>

          {ruolo === "sposi" && (
            <>
              <Link
                href="/admin/inviti?new=1"
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
              >
                <span className="text-3xl">💌</span>
                <div>
                  <h2 className="font-heading text-lg text-marrone">Inviti</h2>
                  <p className="text-sm text-grigio">Gestisci gli inviti</p>
                </div>
              </Link>

              <Link
                href="/admin/invitati"
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
              >
                <span className="text-3xl">👥</span>
                <div>
                  <h2 className="font-heading text-lg text-marrone">Invitati</h2>
                  <p className="text-sm text-grigio">Stato conferme</p>
                </div>
              </Link>
            </>
          )}

          <Link
            href="/admin/note"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-beige md:hover:shadow-md"
          >
            <span className="text-3xl">💬</span>
            <div>
              <h2 className="font-heading text-lg text-marrone">Note</h2>
              <p className="text-sm text-grigio">Comunicazioni</p>
            </div>
          </Link>
        </div>
      </div>
    </AdminGuard>
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
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm md:p-6">
      <p className={`text-2xl font-bold md:text-3xl ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-grigio md:text-sm">{label}</p>
    </div>
  );
}
