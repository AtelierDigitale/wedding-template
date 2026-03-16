const isLocal = process.env.NEXT_PUBLIC_API_URL === "local";

function getBaseUrl(): string {
  if (isLocal) return "";
  return process.env.NEXT_PUBLIC_API_URL || "";
}

function authHeaders(): HeadersInit {
  return { Authorization: "Bearer admin" };
}

export async function fetchInvitiStats() {
  const res = await fetch(`${getBaseUrl()}/api/inviti?stats=1`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function fetchInviti() {
  const res = await fetch(`${getBaseUrl()}/api/inviti`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function fetchInvitati() {
  const res = await fetch(`${getBaseUrl()}/api/inviti?invitati=1`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createInvito(data: {
  nome_gruppo: string;
  invitati: string[];
  note?: string;
}) {
  const res = await fetch(`${getBaseUrl()}/api/inviti`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInvito(id: number) {
  const res = await fetch(`${getBaseUrl()}/api/inviti`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export async function fetchInvito(token: string) {
  const res = await fetch(`${getBaseUrl()}/api/invito?token=${token}`);
  return res.json();
}

export async function postConferma(
  invitati: { id: number; confermato: boolean }[]
) {
  const res = await fetch(`${getBaseUrl()}/api/conferma`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invitati }),
  });
  return res.json();
}

export async function postUpload(formData: FormData) {
  const res = await fetch(`${getBaseUrl()}/api/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchGallery() {
  const res = await fetch(`${getBaseUrl()}/api/gallery`);
  return res.json();
}
