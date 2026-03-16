# Specifiche Complete — Sito Matrimonio Marcella e Francesco

## Informazioni generali

- **Sposi**: Marcella e Francesco
- **Data**: 29 Agosto 2026
- **Location**: Ca' Ross, Via per Sassuolo 115, Formigine (MO)
- **Orario inizio**: 11:30

---

## Architettura

```
┌──────────────────────────┐          ┌───────────────────────────────┐
│   VERCEL (gratuito)       │  ←API→  │   SITEGROUND (già pagato)      │
│                           │         │                                │
│  Next.js Frontend         │         │  PHP API REST                  │
│  + Pannello Admin         │         │  MySQL database                │
│  + Auth (NextAuth.js v5)  │         │  Foto su filesystem (no CDN)   │
│                           │         │                                │
│  *.vercel.app             │         │  Dominio nascosto agli utenti  │
└──────────────────────────┘          └───────────────────────────────┘
```

- **Frontend + Admin**: Next.js (App Router, TypeScript) su Vercel — dominio gratuito `*.vercel.app`
- **Backend API**: PHP su SiteGround — endpoint REST, CORS configurato per accettare solo il dominio Vercel
- **Database**: MySQL su SiteGround
- **Storage foto**: filesystem SiteGround — qualità originale, NESSUNA compressione
- **Auth admin**: NextAuth.js v5 (beta) con CredentialsProvider
- Il dominio SiteGround non è MAI visibile agli invitati

---

## Tech Stack

| Componente | Tecnologia |
|---|---|
| Framework frontend | Next.js (App Router) con TypeScript |
| CSS | Tailwind CSS v4 con `@theme inline` |
| Font titoli | Dancing Script (Google Fonts) — peso 700 |
| Font corpo | Lato (Google Fonts) — pesi 300, 400, 700 |
| Autenticazione | NextAuth.js v5 (beta) con CredentialsProvider |
| Backend produzione | PHP 8+ con PDO/MySQL |
| Database produzione | MySQL (InnoDB, utf8mb4) |
| Database sviluppo locale | SQLite (better-sqlite3) |
| Hosting frontend | Vercel (gratuito) |
| Hosting backend | SiteGround (già disponibile) |

---

## Palette colori

| Nome | Hex | Uso |
|---|---|---|
| `beige` | `#F5F0E8` | Sfondi input, sfondo alternativo |
| `verde` | `#8B9E7E` | Bottoni primari, conferme, accenti positivi |
| `rosa` | `#D4A0A0` | Accenti femminili, rifiuti, dettagli |
| `marrone` | `#8B6F47` | Titoli principali, box data, bottoni admin |
| `bianco` | `#FEFEFE` | Sfondo card |
| `crema` | `#FAF6F0` | Sfondo body |
| `testo` | `#3D3D3D` | Testo corpo |
| `grigio` | `#6B6B6B` | Testo secondario, label, sottotitoli |
| `terracotta` | `#C4856A` | Box regalo, orari timeline, accenti caldi |
| `bosco` | `#5C6E52` | Box dress code, footer, box gallery link |

### CSS Tailwind v4

```css
@theme inline {
  --color-beige: #F5F0E8;
  --color-verde: #8B9E7E;
  --color-rosa: #D4A0A0;
  --color-marrone: #8B6F47;
  --color-bianco: #FEFEFE;
  --color-crema: #FAF6F0;
  --color-testo: #3D3D3D;
  --color-grigio: #6B6B6B;
  --color-terracotta: #C4856A;
  --color-bosco: #5C6E52;
}
```

> **ATTENZIONE Tailwind v4**: i nomi composti con trattino (es. `verde-scuro`) NON funzionano in `@theme inline`. Usare nomi singoli (es. `bosco` invece di `verde-scuro`).

---

## Stile visivo

- **Mood**: Boho, caldo, familiare, informale ma curato
- **Body**: sfondo crema (`#FAF6F0`), font Lato 18px, line-height 1.7
- **Titoli** (h1-h4): font Dancing Script, peso 700
- **Card/box**: bordi arrotondati (`rounded-2xl`), shadow leggera (`shadow-sm`)
- **Bottoni**: forma pill (`rounded-full`), padding generoso, hover con opacity
- **Input**: bordi rosa/30, sfondo beige, focus con bordo verde
- **Link**: nessun colore forzato globale (il colore dipende dal contesto), hover con underline
- **Decorazioni**: icone SVG in stile boho/botanico con fiori e foglie (NO emoji)
- **Separatori**: componente `LeafDivider` — foglia stilizzata tra linee orizzontali, colore verde con opacity 0.5
- **Responsive**: mobile-first, la maggior parte degli invitati usa il telefono

---

## Struttura pagine

```
/                              → Homepage (pagina singola con tutte le info)
/gallery                       → Galleria foto
/upload                        → Upload foto (per QR code)
/invito/[token]                → Invito personalizzato + conferma presenza
/admin/login                   → Login admin
/admin                         → Dashboard admin
/admin/inviti                  → Gestione inviti (crea, lista, elimina)
/admin/invitati                → Lista invitati con stato conferme
```

---

## Layout globale

### Header (sticky, visibile su Home e Gallery)
- Sfondo: crema con opacity 80% + backdrop blur
- Logo testo: **"M & F"** in Dancing Script, colore marrone
- Link navigazione: Home, Gallery — stile uppercase, tracking wide, 12px
- Menu hamburger su mobile
- **NON visibile** su pagine `/admin/*` e `/invito/*`

### Footer
- Sfondo: bosco (`#5C6E52`)
- Testo bianco
- Riga 1 (Dancing Script): "Marcella & Francesco"
- Riga 2 (piccolo, opacity 60%): "29 Agosto 2026 · Ca' Ross, Formigine"

### Metadata
- Title: "Marcella & Francesco - 29 Agosto 2026"
- Description: "Il nostro matrimonio - 29 Agosto 2026 a Ca' Ross, Formigine"
- Lingua: `it`

---

## Homepage — Contenuto completo

La homepage è una singola pagina che contiene tutte le sezioni, separate da `LeafDivider`.

### Sezione 1: Hero

- **Logo**: immagine `/logo.png`, 280×280px, `rounded-full`, con priorità di caricamento
- **Titolo**: "Marcella e Francesco" — Dancing Script, 5xl (mobile) / 7xl (desktop), colore marrone
- **Sottotitolo**: "Ci sposiamo!" — Dancing Script, 3xl / 4xl, colore marrone, grassetto
- **Box data** (sfondo marrone, testo bianco, rounded-2xl, shadow):
  - Riga 1 (Dancing Script 4xl/5xl): "29 Agosto 2026"
  - Riga 2 (base, opacity 80%): "Ca' Ross · Via per Sassuolo 115, Formigine (MO)"

### Sezione 2: La giornata (Timeline)

Titolo sezione: **"La giornata"** — Dancing Script 5xl, marrone, centrato

Timeline verticale con linea verde/30 a sinistra. Ogni evento ha:
- Cerchio icona: 56×56px, sfondo bianco, bordo verde 2px, shadow, con icona SVG boho 36×36px
- Card: sfondo bianco, bordo beige, padding 24px, shadow-sm
  - Orario: terracotta, bold, 12px, uppercase, tracking widest
  - Titolo: Dancing Script 3xl, marrone
  - Descrizione: grigio

| Orario | Titolo | Descrizione | Icona |
|---|---|---|---|
| 11:30 | Vi aspettiamo | Arrivo degli ospiti e benvenuto | FlowerBouquetIcon |
| 12:00 | Ci sposiamo! | La cerimonia | RingsFlowerIcon |
| 12:30 | Si mangia! | Buffet e a seguire grigliatona in giardino | FeastIcon |
| Pomeriggio | Festa in piscina | Open bar, musica e tuffi | PoolPartyIcon |

### Sezione 3: Dress code

Box con sfondo `bosco` (#5C6E52), testo bianco, rounded-2xl, shadow, centrato, padding 40px.

- Icona: `SunFlowerIcon` 48×48px, centrata
- Titolo: **"Cosa mi metto?"** — Dancing Script 4xl
- Testo principale (18px, opacity 90%):
  > Niente panico da outfit! L'unica regola è: vieni come stai bene tu. Infradito, camicia hawaiana, vestito lungo... va tutto benissimo. Non è un matrimonio da giacca e cravatta, è una festa tra amici.
- Box interno (sfondo bianco/15, rounded-xl, padding 20px):
  - Label: **"Consiglio da insider"** — semibold 18px
  - Testo (base, opacity 90%):
    > C'è la piscina e non è lì per bellezza. Portatevi costume, telo e crema solare. Chi si tuffa vince un punto bonus nella nostra classifica degli invitati preferiti.

### Sezione 4: Dove trovarci

Box bianco, bordo beige, rounded-2xl, shadow-sm, centrato, padding 40px.

- Titolo: **"Dove trovarci"** — Dancing Script 4xl, marrone
- Location: **"Ca' Ross"** — semibold, 20px, marrone
- Indirizzo: "Via per Sassuolo 115, Formigine (MO)" — grigio
- Bottone: **"Apri in Google Maps"** — sfondo marrone, testo bianco (`text-bianco!` con important per override), rounded-full, padding 12px×32px
  - Link: `https://maps.google.com/?q=Ca'+Ross+Via+per+Sassuolo+115+Formigine`

### Sezione 5: Il nostro sogno a quattro ruote (Regalo)

Box terracotta, testo bianco, rounded-2xl, shadow, centrato, padding 40px.

- Icona: `CamperIcon` — 112×80px, centrata (camper VW in stile boho con ghirlanda di fiori e bandierine)
- Titolo: **"Il nostro sogno a quattro ruote"** — Dancing Script 4xl
- Testo (base, opacity 90%):
  > Il regalo più bello è avervi con noi quel giorno. Però se vi va di darci una mano, il nostro sogno è un camper per diventare una famiglia a quattro ruote e girare il mondo insieme.
- Box interno (sfondo bianco/15, rounded-xl, padding 20px):
  - Label: "Coordinate bancarie" — 10px, uppercase, tracking widest, opacity 70%
  - IBAN: **"IT00 0000 0000 0000 0000 0000 000"** — semibold, 18px — ⚠️ **TODO: Inserire IBAN reale**
  - Intestatario: "Intestato a Marcella e Francesco" — 14px, opacity 80%
- Footer box: "Causale: \"Fondo camper M&F\" (o quello che vi pare)" — 10px, opacity 60%

### Sezione 6: Link Gallery

Box bosco, testo bianco, rounded-2xl, shadow-md, padding 32px, centrato. Cliccabile (link a `/gallery`).
- Effetto hover: scale 1.02
- Titolo: **"Gallery"** — Dancing Script 3xl
- Sottotitolo: "Le foto del nostro giorno" — opacity 80%

---

## Pagina Gallery (`/gallery`)

### Layout
- Max width 5xl, centrato, padding 16px orizzontale, padding 64px verticale
- Titolo: **"Gallery"** — Dancing Script 4xl, marrone, centrato
- Sottotitolo: "Le foto del nostro giorno speciale, scattate da voi!" — grigio, centrato

### Stato vuoto
- Icona: 📷 (emoji 6xl)
- Testo: "Ancora nessuna foto. Il giorno del matrimonio potrai caricare le tue!"

### Griglia foto
- Layout masonry: 2 colonne (mobile) / 3 colonne (desktop), gap 16px
- Ogni foto:
  - Card bianca, rounded-xl, overflow hidden, shadow-sm
  - Hover: scale 1.02
  - Cliccabile → apre lightbox
  - Sotto l'immagine (se presenti): nome autore (verde, 10px, semibold) + commento (grigio, 10px)

### Lightbox
- Overlay nero 80%, z-50, flex centrato, padding 16px
- Click sull'overlay chiude
- Bottone × in alto a destra, bianco, 30px
- Immagine: max width 4xl, rounded-xl
- Card sotto (se presenti autore/commento): sfondo bianco, rounded-b-xl, padding 16px

### API
- `GET /api/gallery` → array di `{ id, url, nome_autore, commento, uploaded_at }`
- Le immagini usano `unoptimized` (nessuna ottimizzazione Next.js, qualità originale)

---

## Pagina Upload (`/upload`)

> **Obiettivo UX**: Semplicissimo. Anche una nonna di 85 anni deve riuscirci. Pochi elementi, testo grande, un flusso lineare.

### Layout
- Centrato verticalmente e orizzontalmente, min-height screen
- Titolo: **"Condividi le tue foto!"** — Dancing Script 3xl, marrone
- Sottotitolo: "Marcella & Francesco · 29.08.2026" — grigio, 18px

### Flusso
1. **Stato iniziale**: UN SOLO BOTTONE GRANDE
   - "📷 Scegli una foto" — sfondo verde, testo bianco, rounded-2xl, padding 32px verticale, 20px testo
   - L'icona della fotocamera (📷) è grande (4xl) sopra il testo
   - Input file nascosto: `accept="image/*"`

2. **Dopo selezione foto** → appare:
   - Preview dell'immagine selezionata (max height 320px, rounded-xl, object-cover)
   - Campo "Il tuo nome (facoltativo)" — input text
   - Campo "Un commento (facoltativo)" — input text
   - Due bottoni affiancati:
     - "Annulla" — sfondo beige, testo grigio, flex-1
     - "Invia foto" — sfondo verde, testo bianco, flex-2
   - Se errore: "Errore nel caricamento. Riprova!" — rosso, 14px

3. **Dopo invio riuscito** → schermata di successo:
   - Icona: ✨ (6xl)
   - "Foto caricata!" — verde, 20px, semibold
   - "Grazie per aver condiviso questo momento" — grigio
   - Bottone: **"Carica un'altra foto"** — sfondo verde, testo bianco, rounded-full, full width

### API
- `POST /api/upload` — multipart/form-data
  - `foto`: file immagine (obbligatorio)
  - `nome_autore`: stringa (opzionale)
  - `commento`: stringa (opzionale)
- **NESSUNA compressione** — le foto vanno salvate in qualità originale sul filesystem

### QR Code
- L'URL della pagina upload (`https://dominio.vercel.app/upload`) viene stampato come QR code il giorno del matrimonio
- Il QR code viene generato dal pannello admin

---

## Pagina Invito Personalizzato (`/invito/[token]`)

### Flusso
1. L'admin crea un invito dal pannello → genera un token univoco → URL tipo `dominio.vercel.app/invito/abc123def456...`
2. L'admin condivide il link (WhatsApp, email, ecc.)
3. L'invitato apre il link → vede la pagina personalizzata

### Layout

**Stato caricamento**: centrato, "Caricamento..."

**Stato errore (token non valido)**:
- Emoji: 😕 (4xl)
- Testo: "Invito non trovato"

**Stato invito aperto**:
- Logo: `/logo.png` 150×150px, rounded-full
- Titolo: **"Siete invitati!"** — Dancing Script 3xl, marrone
- Sottotitolo: "Marcella & Francesco vi aspettano" — grigio
- Data: "29 Agosto 2026 · Ca' Ross, Formigine" — verde, semibold

**Card conferma** (sfondo bianco, rounded-2xl, shadow-sm, max width md):
- Titolo: nome del gruppo (es. "Famiglia Rossi") — Dancing Script xl, marrone
- Istruzione: "Confermate la vostra presenza per ciascun invitato:" — 14px, grigio

**Per ogni invitato nel gruppo**:
- Card beige, rounded-xl, padding 16px
- Nome invitato — semibold
- Due bottoni affiancati:
  - **"Ci sono!"** — Se selezionato: sfondo verde, testo bianco. Se non selezionato: sfondo bianco, bordo verde/30
  - **"Non posso"** — Se selezionato: sfondo rosa, testo bianco. Se non selezionato: sfondo bianco, bordo rosa/30

**Bottone conferma**: "Conferma" — sfondo marrone, testo bianco, rounded-full, full width, disabled finché non tutti hanno risposto (opacity 40% quando disabled)

**Stato dopo conferma**:
- Emoji: 🎉 (6xl)
- Titolo: **"Grazie!"** — Dancing Script 2xl, marrone
- Testo: "La vostra risposta è stata registrata. Non vediamo l'ora di festeggiare insieme!"
- Footer: "29 Agosto 2026 · Ca' Ross, Formigine" — 14px, grigio

### API
- `GET /api/invito?token=ABC` → `{ invito: { id, token, nome_gruppo, note }, invitati: [{ id, nome, confermato }] }`
- `POST /api/conferma` — body: `{ invitati: [{ id: number, confermato: boolean }] }`

---

## Pannello Admin

### Login (`/admin/login`)

- Card bianca centrata, max width sm
- Logo piccolo (80×80px), rounded-full
- Titolo: **"Area Admin"** — Dancing Script 2xl, marrone
- Campi: Username, Password — stile standard (bordo rosa/30, sfondo beige)
- Bottone: **"Accedi"** — sfondo marrone, testo bianco, rounded-full
- Errore: "Credenziali non valide" — rosso, 14px
- Autenticazione: NextAuth.js v5 CredentialsProvider

**Credenziali** (configurabili via `.env`):
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cambiami123
NEXTAUTH_SECRET=genera-una-stringa-random-qui
```

### Dashboard (`/admin`)

Header: "Dashboard" + link "Vai al sito"

**4 box statistiche** (griglia 2×2 mobile / 4 colonne desktop):
| Stat | Colore numero | Label |
|---|---|---|
| Totale inviti creati | marrone | "Inviti creati" |
| Confermati | verde | "Confermati" |
| Non vengono | rosa | "Non vengono" |
| In attesa | grigio | "In attesa" |

**3 box navigazione** (griglia 1 colonna mobile / 3 colonne desktop):

1. **Gestione Inviti** → link a `/admin/inviti`
   - "Crea, visualizza e gestisci gli inviti"

2. **Lista Invitati** → link a `/admin/invitati`
   - "Vedi lo stato delle conferme"

3. **QR Code Gallery** (non cliccabile)
   - "Per la pagina upload foto"
   - Mostra URL da stampare nel QR: `{origin}/upload`

### Gestione Inviti (`/admin/inviti`)

**Breadcrumb**: ← Dashboard

**Bottone**: "+ Nuovo Invito" / "Chiudi" — toggle form

**Form nuovo invito** (card bianca):
- "Nome gruppo" — input text (es. "Famiglia Rossi") — obbligatorio
- "Nomi invitati (uno per riga)" — textarea 4 righe — obbligatorio
  - Placeholder: "Mario Rossi\nAnna Rossi\nLuca Rossi"
- "Note" — input text — opzionale
- Bottone: "Crea Invito" — sfondo marrone

**Lista inviti** — ogni invito è una card bianca con:
- Nome gruppo (semibold, marrone, 18px)
- Stats inline: "X invitati · Y confermati · Z rifiutati · W in attesa"
- Note (se presenti, italic, grigio)
- Bottoni:
  - "Copia link" — sfondo verde/10, testo verde — copia URL `{origin}/invito/{token}` negli appunti
  - "Elimina" — sfondo rosa/10, testo rosa — con `confirm()` di sicurezza

**Stato vuoto**: 💌 + "Nessun invito creato. Inizia creando il primo!"

### Lista Invitati (`/admin/invitati`)

**Breadcrumb**: ← Dashboard

**Filtri** — bottoni pill:
- Tutti (N)
- Confermati (N)
- Non vengono (N)
- In attesa (N)
- Filtro attivo: sfondo marrone, testo bianco. Inattivo: sfondo bianco, testo grigio

**Tabella** (card bianca, rounded-2xl):
| Colonna | Contenuto |
|---|---|
| Nome | Nome invitato (semibold) |
| Gruppo | Nome gruppo (grigio, 14px) |
| Stato | Badge: "Confermato" (verde/10), "Non viene" (rosa/10), "In attesa" (beige) |

---

## Icone SVG Boho

Tutte le icone sono SVG inline, stile botanico/boho coerente con il logo del matrimonio. Colori: rosa (#D4A0A0), rosa chiaro (#E8B4B4), terracotta (#C4856A), verde (#8B9E7E), bosco (#5C6E52), marrone (#8B6F47).

### FlowerBouquetIcon
Mazzo di fiori con steli. Fiore rosa grande centrale (r=5), due fiori più piccoli rosa chiaro ai lati (r=3.5), foglie ellittiche verdi e bosco inclinate, tre steli che convergono verso il basso.

### RingsFlowerIcon
Due anelli intrecciati (cerchi non riempiti, stroke terracotta e marrone), con fiorellini rosa e rosa chiaro sopra gli anelli, foglioline verdi ai lati.

### FeastIcon
Griglia/BBQ: rettangolo marrone orizzontale con linee verticali terracotta (griglie), due gambe marrone inclinate, riccioli di fumo rosa con opacity, foglie decorative verdi ai lati.

### PoolPartyIcon
Piscina vista dall'alto (ellisse verde), onde stilizzate, fenicottero gonfiabile (cerchio rosa + collo curvo + testa), palma (tronco marrone + chiome verdi ellittiche), sole terracotta con raggi.

### SunFlowerIcon
Girasole: 6 petali ellittici terracotta disposti a raggiera (opacity 0.7), centro marrone (r=5) con cerchio interno terracotta (r=3).

### CamperIcon (viewBox 56×40)
Furgone VW stilizzato in stile boho:
- Ghirlanda di fiori sul tetto (fiori rosa/rosa chiaro alternati con foglie verdi)
- Corpo terracotta con striscia marrone trasparente
- Finestrini arrotondati color crema
- Porta laterale
- Cabina verde con parabrezza crema
- Ruote scure con dettaglio
- Bandierine colorate appese (rosa, terracotta, verde alternati)
- Fiorellino decorativo sul davanti

### LeafDivider
Separatore orizzontale: due linee (80px ciascuna) con foglia ellittica SVG verde al centro. Opacity 50%, margine verticale 48px.

---

## Database

### Tabella `inviti`

```sql
CREATE TABLE inviti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(32) NOT NULL UNIQUE,
  nome_gruppo VARCHAR(255) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- `token`: stringa hex di 32 caratteri generata con `crypto.randomBytes(16)`

### Tabella `invitati`

```sql
CREATE TABLE invitati (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invito_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  confermato TINYINT DEFAULT NULL,
  confirmed_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (invito_id) REFERENCES inviti(id) ON DELETE CASCADE,
  INDEX idx_invito (invito_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- `confermato`: NULL = non ha risposto, 1 = confermato, 0 = rifiutato

### Tabella `foto`

```sql
CREATE TABLE foto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  nome_autore VARCHAR(255) DEFAULT NULL,
  commento TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uploaded (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## API Endpoints

Tutte le API usano base path `/api`. In sviluppo locale sono Next.js API routes (con SQLite). In produzione sono file PHP su SiteGround (con MySQL).

### `GET /api/inviti`

Uso admin. Parametri query:
- `?stats=1` → ritorna statistiche aggregate
- `?invitati=1` → ritorna lista completa invitati
- (nessun parametro) → ritorna lista inviti con conteggi

**Risposta stats=1:**
```json
{
  "totale_inviti": 10,
  "totale_invitati": 25,
  "confermati": 12,
  "rifiutati": 3,
  "in_attesa": 10
}
```

**Risposta lista inviti:**
```json
[
  {
    "id": 1,
    "token": "abc123...",
    "nome_gruppo": "Famiglia Rossi",
    "created_at": "2026-03-15T10:00:00",
    "note": "",
    "totale_invitati": 3,
    "confermati": 2,
    "rifiutati": 0,
    "in_attesa": 1
  }
]
```

**Risposta invitati=1:**
```json
[
  {
    "id": 1,
    "nome": "Mario Rossi",
    "confermato": 1,
    "confirmed_at": "2026-03-16T14:30:00",
    "nome_gruppo": "Famiglia Rossi"
  }
]
```

Header richiesto: `Authorization: Bearer admin`

### `POST /api/inviti`

Crea un nuovo invito.

**Body:**
```json
{
  "nome_gruppo": "Famiglia Rossi",
  "invitati": ["Mario Rossi", "Anna Rossi", "Luca Rossi"],
  "note": "Amici di università"
}
```

**Risposta:**
```json
{
  "id": 1,
  "token": "a1b2c3d4e5f6..."
}
```

Header richiesto: `Authorization: Bearer admin`

### `DELETE /api/inviti`

Elimina un invito e tutti i suoi invitati (CASCADE).

**Body:**
```json
{ "id": 1 }
```

Header richiesto: `Authorization: Bearer admin`

### `GET /api/invito?token=ABC`

Recupera invito per token (usato dalla pagina invitato).

**Risposta:**
```json
{
  "invito": {
    "id": 1,
    "token": "abc123...",
    "nome_gruppo": "Famiglia Rossi",
    "note": ""
  },
  "invitati": [
    { "id": 1, "nome": "Mario Rossi", "confermato": null },
    { "id": 2, "nome": "Anna Rossi", "confermato": 1 }
  ]
}
```

Nessuna autenticazione richiesta.

### `POST /api/conferma`

Registra le conferme/rifiuti degli invitati.

**Body:**
```json
{
  "invitati": [
    { "id": 1, "confermato": true },
    { "id": 2, "confermato": false }
  ]
}
```

Nessuna autenticazione richiesta. Aggiorna `confirmed_at` con timestamp corrente.

### `POST /api/upload`

Upload foto. Multipart/form-data.

**Campi:**
- `foto`: file immagine (obbligatorio)
- `nome_autore`: stringa (opzionale)
- `commento`: stringa (opzionale)

**Risposta:**
```json
{ "ok": true }
```

Nessuna autenticazione richiesta. Il file viene salvato sul filesystem con nome univoco (UUID/timestamp). NESSUNA compressione o ridimensionamento.

### `GET /api/gallery`

Lista di tutte le foto caricate, ordinate per data discendente.

**Risposta:**
```json
[
  {
    "id": 1,
    "url": "/uploads/foto/1679000000_abc123.jpg",
    "nome_autore": "Marco",
    "commento": "Che giornata!",
    "uploaded_at": "2026-08-29T14:30:00"
  }
]
```

Nessuna autenticazione richiesta.

---

## Backend PHP (SiteGround)

### Struttura file

```
siteground-api/
├── .htaccess           # CORS, rewriting, protezione
├── config.php          # Credenziali DB, URL CORS, path upload
├── db.php              # Connessione PDO, helper CORS/auth/JSON
├── schema.sql          # CREATE TABLE per MySQL
├── api/
│   ├── inviti.php      # GET/POST/DELETE inviti
│   ├── invito.php      # GET invito per token
│   ├── conferma.php    # POST conferma presenza
│   ├── upload.php      # POST upload foto
│   └── gallery.php     # GET lista foto
└── uploads/
    └── foto/           # Cartella foto caricate
```

### Configurazione CORS (.htaccess)

```apache
# CORS per Vercel
Header always set Access-Control-Allow-Origin "https://TUO-DOMINIO.vercel.app"
Header always set Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Gestione preflight OPTIONS
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Protezione cartella uploads (accesso diretto consentito solo alle immagini)
<FilesMatch "\.(php|php5|phtml)$">
  Deny from all
</FilesMatch>

# Limit upload size
php_value upload_max_filesize 50M
php_value post_max_size 50M
```

### config.php

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'nome_database');
define('DB_USER', 'utente_db');
define('DB_PASS', 'password_db');
define('CORS_ORIGIN', 'https://TUO-DOMINIO.vercel.app');
define('UPLOAD_DIR', __DIR__ . '/uploads/foto/');
define('UPLOAD_URL', 'https://TUO-DOMINIO-SITEGROUND/uploads/foto/');
define('ADMIN_TOKEN', 'admin'); // Token semplice per auth admin
```

### Variabili d'ambiente (.env.local per sviluppo)

```
NEXT_PUBLIC_API_URL=local
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cambiami123
NEXTAUTH_SECRET=genera-una-stringa-random-qui
NEXTAUTH_URL=http://localhost:3000
```

---

## Sviluppo locale

Per lo sviluppo locale, le API Next.js usano SQLite (via `better-sqlite3`) come mirror del backend PHP/MySQL. Le route API locali si trovano in:

```
src/app/api/
├── auth/[...nextauth]/route.ts   # Auth NextAuth
├── inviti/route.ts                # GET/POST/DELETE inviti
├── invito/route.ts                # GET invito per token
├── conferma/route.ts              # POST conferma
├── upload/route.ts                # POST upload foto
└── gallery/route.ts               # GET gallery
```

Il file `src/lib/local-db.ts` gestisce il database SQLite con le stesse tabelle del MySQL di produzione.

---

## Note importanti per lo sviluppatore

1. **Tailwind v4**: usare `@theme inline` per i colori custom. I nomi con trattino NON funzionano (es. `verde-scuro`). Usare nomi singoli.

2. **Font Dancing Script**: il carattere `&` appare come "e" minuscola in questo font. Dove serve la `&` vera (es. header "M & F"), usare `&amp;` in JSX — funziona nel contesto del componente Header.

3. **Link con sfondo colorato**: i link globali NON devono avere un colore forzato via CSS. Se un link ha classe `text-bianco` ma non funziona, usare `text-bianco!` (Tailwind important) oppure assicurarsi che non ci siano regole CSS globali su `a { color: ... }`.

4. **Foto**: ZERO compressione. Le foto vanno salvate in qualità originale. Lo storage è su SiteGround (spazio abbondante).

5. **Upload foto UX**: deve essere ultrasemplice. Un bottone grande, flusso lineare, nessun login. Testare su dispositivi reali di persone non tecniche.

6. **Dominio SiteGround nascosto**: il dominio del backend su SiteGround non deve mai apparire nelle URL visibili agli invitati. Le chiamate API passano tramite CORS dal frontend Vercel.

7. **Responsive**: tutto deve funzionare perfettamente su mobile. La maggior parte degli invitati userà il telefono.

8. **NextAuth v5**: è in beta. Potrebbe richiedere aggiustamenti. L'alternativa è un sistema di auth custom più semplice (session cookie con API route dedicata).

9. **Ordine delle sezioni in homepage**: Hero → La giornata → Dress code → Dove trovarci → Regalo (camper) → Link Gallery.

10. **IBAN**: placeholder nel codice, da sostituire con quello reale prima del deploy.
