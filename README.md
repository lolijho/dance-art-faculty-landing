# Landing Open Day · Liceo Coreutico DAF

Landing per le campagne ads "Open Day Liceo Coreutico DAF 2026/27", con backend
Node.js + Postgres e area admin (`/admin`) per modificare **tutti i testi** del
sito senza toccare il codice.

## Struttura

```
landing/            sito statico (index.html, styles.css, script.js, img/)
admin/              area admin (login + editor testi)
server/             backend Express
  index.js          HTTP: static, /api/content, /api/login, /health
  content-defaults.js  testi di default (unica fonte di verità, 121 chiavi)
  content.js        etichette + sanitizzazione allowlist dei tag
  db.js             connessione Postgres (tabella `content`, key/value)
  auth.js           sessione cookie firmata (HMAC), password timing-safe
scripts/
  apply-content-keys.mjs   collega le chiavi ai nodi HTML (data-content)
  verify-content.mjs       verifica HTML ↔ default
```

## Come funziona

- Ogni testo editabile in `landing/index.html` ha `data-content="chiave"`.
- Al load, `script.js` chiama `GET /api/content` e sostituisce i contenuti;
  se il backend non risponde restano i testi statici (default del codice).
- **Page builder**: da `/admin` (o diretti su `/?edit=1`) si modificano i testi
  direttamente in pagina — clicchi il testo, scrivi, premi **Salva** nella barra
  in basso (o Cmd/Ctrl+S). I valori ripetuti in pagina (ticker, email) si
  aggiornano insieme; "Termina" esce dalla modalità modifica.
- L'elenco completo dei testi resta su `/admin`: utile per `meta.title`,
  `meta.description` (non visibili in pagina) e per il reset al default campo per campo.
- I valori modificati sono nella tabella `content` (key/value) e **sovrascrivono**
  i default; l'API marca ogni item con `overridden` così anche un testo
  svuotato viene applicato invece di ricadere sul default.

Per aggiungere nuovi testi editabili: aggiungi la chiave in
`server/content-defaults.js` + un `data-content="..."` nell'HTML, poi esegui
`node scripts/verify-content.mjs`.

## Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | sì (per salvare) | es. `postgres://user:pass@host:5432/daf` |
| `ADMIN_PASSWORD` | sì (per l'admin) | password di accesso a `/admin` |
| `AUTH_SECRET` | consigliata | chiave per firmare il cookie di sessione |
| `PORT` | no (default 3000) | Coolify la inietta |

Senza `DATABASE_URL` il sito funziona con i testi di default e l'editor non può
salvare; senza `ADMIN_PASSWORD` l'area admin è disabilitata.

## Avvio locale

```bash
npm install
createdb daf_landing
DATABASE_URL=postgres://localhost:5432/daf_landing ADMIN_PASSWORD=test npm start
# landing: http://localhost:3000   admin: http://localhost:3000/admin
```

## Deploy (Coolify)

1. Nello stesso progetto crea un servizio **PostgreSQL** (es. `postgres-landing`).
2. Sull'app imposta le env:
   - `DATABASE_URL=postgres://UTENTE:PASSWORD@postgres-landing:5432/landing`
     (nome host = nome del servizio Postgres dentro la rete del progetto)
   - `ADMIN_PASSWORD=...` e, consigliato, `AUTH_SECRET=<stringa lunga a caso>`
3. Redeploy: il server crea la tabella al primo avvio (retry 30s).
4. Attività su `/admin`, entra con la password, modifica e premi **Salva**.
