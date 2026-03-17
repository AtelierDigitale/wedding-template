"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Invitato {
  id: number;
  nome: string;
  genere: string;
  confermato: number | null;
}

interface InvitoData {
  invito: {
    id: number;
    token: string;
    nome_gruppo: string;
    note: string;
  };
  invitati: Invitato[];
}

type Status = "loading" | "open" | "confirmed" | "error";

function getTitolo(invitati: Invitato[]): string {
  if (invitati.length === 1) {
    return invitati[0].genere === "F" ? "Sei invitata!" : "Sei invitato!";
  }
  return "Siete invitati!";
}

function getSubtitle(invitati: Invitato[]): string {
  if (invitati.length === 1) {
    return "Marcella & Francesco ti aspettano";
  }
  return "Marcella & Francesco vi aspettano";
}

function getConfermaLabel(invitati: Invitato[]): string {
  const pending = invitati.filter((inv) => inv.confermato === null);
  if (pending.length === 0) return "";
  if (pending.length === 1 && invitati.length === 1) {
    return "Conferma la tua presenza:";
  }
  return "Confermate la vostra presenza:";
}

export default function InvitoPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<InvitoData | null>(null);
  const [responses, setResponses] = useState<Record<number, boolean | null>>(
    {}
  );

  useEffect(() => {
    fetch(`/api/invito?token=${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: InvitoData) => {
        setData(d);
        const allConfirmed = d.invitati.every(
          (inv) => inv.confermato !== null
        );
        if (allConfirmed) {
          setStatus("confirmed");
        } else {
          setStatus("open");
          const initial: Record<number, boolean | null> = {};
          d.invitati.forEach((inv) => {
            // Only pending ones get null (editable), already confirmed stay as-is
            initial[inv.id] =
              inv.confermato === null ? null : inv.confermato === 1;
          });
          setResponses(initial);
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  // Only pending invitati need to answer
  const pendingInvitati = data?.invitati.filter((inv) => inv.confermato === null) ?? [];
  const confirmedInvitati = data?.invitati.filter((inv) => inv.confermato !== null) ?? [];

  const anyPendingAnswered =
    pendingInvitati.some((inv) => responses[inv.id] !== null && responses[inv.id] !== undefined);

  async function handleConfirm() {
    if (!data) return;
    // Only send responses for pending invitati
    const invitati = pendingInvitati
      .filter((inv) => responses[inv.id] !== null && responses[inv.id] !== undefined)
      .map((inv) => ({
        id: inv.id,
        confermato: responses[inv.id] as boolean,
      }));

    if (invitati.length === 0) return;

    await fetch("/api/conferma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitati }),
    });

    // Reload data to show updated state
    const r = await fetch(`/api/invito?token=${token}`);
    if (r.ok) {
      const d: InvitoData = await r.json();
      setData(d);
      const allDone = d.invitati.every((inv) => inv.confermato !== null);
      if (allDone) {
        setStatus("confirmed");
      } else {
        // Reset responses for remaining pending
        const updated: Record<number, boolean | null> = {};
        d.invitati.forEach((inv) => {
          updated[inv.id] = inv.confermato === null ? null : inv.confermato === 1;
        });
        setResponses(updated);
      }
    } else {
      setStatus("confirmed");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crema">
        <p className="text-grigio">Caricamento...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crema text-center">
        <div>
          <p className="text-4xl">😕</p>
          <p className="mt-4 text-lg text-grigio">Invito non trovato</p>
        </div>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crema px-4 text-center">
        <div>
          <p className="text-6xl">🎉</p>
          <h1 className="mt-4 font-heading text-2xl text-marrone">Grazie!</h1>
          <p className="mt-2 text-grigio">
            Non vediamo l&apos;ora di festeggiare insieme!
          </p>
          <p className="mt-4 text-sm text-grigio">
            29 Agosto 2026 · Ca&apos; Ross, Formigine
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-marrone px-8 py-3 text-bianco! hover:opacity-90"
          >
            Guarda il programma della giornata
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-crema px-4 py-12">
      <Image
        src="/logo.png"
        alt="Logo Marcella e Francesco"
        width={225}
        height={225}
        className="rounded-full"
        priority
      />

      <h1 className="mt-8 text-center font-heading text-5xl text-marrone md:text-7xl">
        Marcella e Francesco
      </h1>

      <p className="mt-4 font-heading text-3xl font-bold text-marrone md:text-4xl">
        Ci sposiamo!
      </p>

      <div className="mt-8 rounded-2xl bg-marrone px-8 py-6 text-white shadow-lg">
        <p className="font-heading text-4xl md:text-5xl">29 Agosto 2026</p>
        <p className="mt-2 text-base opacity-80">
          Ca&apos; Ross · Via per Sassuolo 115, Formigine (MO)
        </p>
      </div>

      <h2 className="mt-8 font-heading text-3xl text-marrone">
        {getTitolo(data?.invitati ?? [])}
      </h2>
      <p className="mt-2 font-heading text-xl text-grigio">
        {getSubtitle(data?.invitati ?? [])}
      </p>

      <div className="mt-6 text-center">
        <p className="font-heading text-xl text-marrone">Ascolta la versione audio dell&apos;invito</p>
        <audio controls className="mt-3" preload="none">
          <source src="/angie.mp3" type="audio/mpeg" />
        </audio>
      </div>

      <div className="mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        {/* Already confirmed invitati */}
        {confirmedInvitati.length > 0 && (
          <div className="mb-4 space-y-2">
            {confirmedInvitati.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl bg-beige p-4">
                <p className="font-semibold">{inv.nome}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    inv.confermato === 1
                      ? "bg-verde/10 text-verde"
                      : "bg-rosa/10 text-rosa"
                  }`}
                >
                  {inv.confermato === 1 ? "Ci sarà!" : "Non viene"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pending invitati */}
        {pendingInvitati.length > 0 && (
          <>
            <p className="text-sm text-grigio">
              {getConfermaLabel(data?.invitati ?? [])}
            </p>

            <div className="mt-4 space-y-3">
              {pendingInvitati.map((inv) => (
                <div key={inv.id} className="rounded-xl bg-beige p-4">
                  <p className="font-semibold">{inv.nome}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        setResponses((r) => ({ ...r, [inv.id]: true }))
                      }
                      className={`flex-1 rounded-full px-4 py-2 text-sm ${
                        responses[inv.id] === true
                          ? "bg-verde text-white"
                          : "border border-verde/30 bg-white text-verde"
                      }`}
                    >
                      Ci sono!
                    </button>
                    <button
                      onClick={() =>
                        setResponses((r) => ({ ...r, [inv.id]: false }))
                      }
                      className={`flex-1 rounded-full px-4 py-2 text-sm ${
                        responses[inv.id] === false
                          ? "bg-rosa text-white"
                          : "border border-rosa/30 bg-white text-rosa"
                      }`}
                    >
                      Non posso
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!anyPendingAnswered}
              className={`mt-6 w-full rounded-full py-3 text-white ${
                anyPendingAnswered
                  ? "bg-marrone hover:opacity-90"
                  : "bg-marrone opacity-40"
              }`}
            >
              Conferma
            </button>
          </>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-bosco px-8 py-3 text-bianco! hover:opacity-90"
      >
        Guarda il programma della giornata
      </Link>
    </div>
  );
}
