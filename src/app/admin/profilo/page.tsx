"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AdminGuard from "@/components/AdminGuard";

export default function ProfiloPage() {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAny = session?.user as any;
  const username = userAny?.username || userAny?.image || "";
  const displayName = session?.user?.name || "";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (newPassword.length < 6) {
      setError("La nuova password deve avere almeno 6 caratteri");
      return;
    }

    setLoading(true);

    try {
      // We need the actual username, not the display name
      // Get it from session - the authorize function stores nome in name
      // We need to pass the actual username for the DB lookup
      const res = await fetch("/api/utenti?action=change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore nel cambio password");
      } else {
        setMessage("Password cambiata con successo!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="font-heading text-3xl text-marrone">Cambia password</h1>
        <p className="mt-2 text-sm text-grigio">
          Accesso come <span className="font-semibold text-testo">{displayName}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-grigio">
              Password attuale
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-grigio">
              Nuova password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-grigio">
              Conferma nuova password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-rosa/30 bg-beige px-4 py-3 focus:border-verde focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>
          )}
          {message && (
            <p className="rounded-xl bg-verde/10 px-4 py-3 text-sm text-verde">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-marrone py-3 text-white active:opacity-80 disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Cambia password"}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
