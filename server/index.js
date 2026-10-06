"use strict";

const path = require("path");
const express = require("express");

const db = require("./db");
const auth = require("./auth");
const { DEFAULTS, META, sanitizeValue, renderValue } = require("./content");

/* Suggerimenti pratici per gli errori Postgres più comuni: vengono loggati
   all'avvio e mostrati all'admin quando il salvataggio fallisce */
const DB_HINTS = {
  "3D000": 'il database nell\'URL non esiste: il nome dopo "/" in DATABASE_URL deve corrispondere a POSTGRES_DB del servizio Postgres (default: "postgres")',
  "28P01": "password errata: usa POSTGRES_PASSWORD del servizio (caratteri speciali come @ : / % vanno codificati nell'URL)",
  ECONNREFUSED: "host o porta sbagliati: usa il nome del servizio Postgres sulla stessa rete e la porta interna 5432",
  ENOTFOUND: "hostname non risolto: usa il nome del servizio Postgres nello stesso progetto (non localhost né l'IP pubblico)",
  EAI_AGAIN: "DNS temporaneamente non disponibile: riprova; se persiste controlla il nome del servizio",
};
function dbHint(err) {
  return DB_HINTS[err && (err.code || "")];
}

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, "..");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "200kb" }));

/* Header di sicurezza (come nella config nginx precedente) */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

/* Healthcheck per Coolify */
app.get("/health", (req, res) => res.type("text/plain").send("ok"));

/* ---------- Auth ---------- */

if (!process.env.ADMIN_PASSWORD) {
  console.warn("[auth] ADMIN_PASSWORD non impostata: /admin e le API di scrittura sono disabilitate.");
}

/* Rate limit banale sul login: max 10 tentativi / 10 minuti per IP */
const loginAttempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  let rec = loginAttempts.get(ip);
  if (!rec || rec.resetAt < now) {
    rec = { n: 0, resetAt: now + 10 * 60 * 1000 };
    loginAttempts.set(ip, rec);
  }
  rec.n += 1;
  return rec.n > 10;
}

app.post("/api/login", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: "Admin non configurata (ADMIN_PASSWORD mancante)." });
  }
  const ip = req.ip || "?";
  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: "Troppi tentativi, riprova più tardi." });
  }
  if (!auth.checkPassword(req.body && req.body.password)) {
    return res.status(401).json({ error: "Password errata." });
  }
  const secure = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.setHeader(
    "Set-Cookie",
    `${auth.COOKIE}=${auth.makeToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(auth.TTL_MS / 1000)}` +
      (secure ? "; Secure" : "")
  );
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  res.json({ authed: auth.isAuthed(req) });
});

app.post("/api/logout", (req, res) => {
  res.setHeader("Set-Cookie", `${auth.COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.json({ ok: true });
});

function requireAdmin(req, res, next) {
  if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: "Admin non configurata." });
  if (!auth.isAuthed(req)) return res.status(401).json({ error: "Non autorizzato." });
  next();
}

/* ---------- Content API ---------- */

app.get("/api/content", async (req, res) => {
  let overrides = {};
  try {
    overrides = await db.getOverrides();
  } catch (err) {
    console.error("[content] lettura DB fallita, uso i default:", err.message);
  }
  const items = Object.keys(DEFAULTS).map((key) => {
    const overridden = Object.prototype.hasOwnProperty.call(overrides, key);
    const src = overridden ? overrides[key] : DEFAULTS[key];
    return {
      key,
      label: META[key].label,
      section: META[key].section,
      type: META[key].type,
      def: DEFAULTS[key],
      value: src,
      html: renderValue(META[key], src),
      overridden,
    };
  });
  res.set("Cache-Control", "no-store").json({ items });
});

app.put("/api/content", requireAdmin, async (req, res) => {
  const updates = req.body && req.body.updates;
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return res.status(400).json({ error: "Body atteso: { updates: { chiave: valore } }." });
  }
  const clean = [];
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in DEFAULTS)) return res.status(400).json({ error: `Chiave sconosciuta: ${key}` });
    if (typeof value !== "string") return res.status(400).json({ error: `Valore non valido per ${key}` });
    if (value.length > 5000) return res.status(400).json({ error: `${key}: testo troppo lungo (max 5000 caratteri).` });
    clean.push({ key, value: sanitizeValue(key, value) });
  }
  if (clean.length === 0) return res.json({ ok: true, saved: 0 });
  try {
    await db.saveOverrides(clean);
    res.json({ ok: true, saved: clean.length });
  } catch (err) {
    console.error("[content] salvataggio fallito:", err.code || "", err.message);
    const hint = dbHint(err);
    if (hint) return res.status(503).json({ error: `Database non disponibile — ${hint}` });
    return res.status(500).json({ error: "Errore interno durante il salvataggio (dettaglio nei log del server)." });
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

/* ---------- Static ---------- */

/* Area admin: /admin */
app.use(
  "/admin",
  express.static(path.join(ROOT, "admin"), {
    index: "index.html",
    maxAge: "1h",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

/* Landing alla root: asset in cache 7 giorni, html sempre rivalidato */
app.use(
  express.static(path.join(ROOT, "landing"), {
    index: "index.html",
    maxAge: "7d",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

/* Fallback come il try_files di nginx */
app.use((req, res) => {
  res.sendFile(path.join(ROOT, "landing", "index.html"));
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON non valido." });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Payload troppo grande." });
  console.error("[server] errore:", err.message);
  res.status(500).json({ error: "Errore interno." });
});

/* ---------- Avvio ---------- */

async function waitForDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("[db] DATABASE_URL mancante: il sito gira con i testi di default, l'editor non può salvare.");
    return;
  }
  for (let i = 1; i <= 30; i++) {
    try {
      await db.ensureSchema();
      const info = await db.pingInfo();
      console.log(`[db] schema pronto: database "${info.db}", utente "${info.usr}".`);
      return;
    } catch (err) {
      const hint = dbHint(err);
      console.warn(
        `[db] attesa Postgres (${i}/30): ${err.code || ""} ${err.message}${hint ? " — " + hint : ""}`
      );
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error("[db] Postgres non raggiungibile dopo 30s: il sito parte comunque con i testi di default.");
}

app.listen(PORT, () => console.log(`[server] in ascolto su :${PORT}`));
waitForDb();
