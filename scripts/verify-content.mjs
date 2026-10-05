/* Verifica di coerenza tra i testi di default e landing/index.html:
   - ogni chiave dei default (tranne meta.*) deve avere un attributo
     data-content nell'HTML;
   - ogni attributo data-content nell'HTML deve esistere nei default.
   Uso: node scripts/verify-content.mjs */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DEFAULTS } = require("../server/content-defaults.js");

const html = readFileSync(new URL("../landing/index.html", import.meta.url), "utf8");
const counts = new Map();
for (const m of html.matchAll(/data-content="([^"]+)"/g)) {
  counts.set(m[1], (counts.get(m[1]) || 0) + 1);
}

const expectedOnce = Object.keys(DEFAULTS).filter((k) => k !== "meta.title" && k !== "meta.description");
const missing = expectedOnce.filter((k) => !counts.has(k));
const unknown = [...counts.keys()].filter((k) => !(k in DEFAULTS));
const multi = [...counts.entries()].filter(([k, n]) => n > 1 && k !== "contatti.email");

let bad = 0;
if (missing.length) {
  console.error(`✗ chiavi senza data-content nell'HTML (${missing.length}):`);
  for (const k of missing) console.error(`  - ${k}`);
  bad++;
}
if (unknown.length) {
  console.error(`✗ chiavi nell'HTML senza default (${unknown.length}):`);
  for (const k of unknown) console.error(`  - ${k}`);
  bad++;
}
if (multi.length) {
  console.error(`⚠ chiavi applicate a più elementi: ${multi.map(([k, n]) => `${k}×${n}`).join(", ")}`);
}
if (bad) process.exit(1);

const total = [...counts.values()].reduce((a, b) => a + b, 0);
console.log(`✓ coerenza OK — ${counts.size} chiavi uniche, ${total} attributi data-content, ${expectedOnce.length} default mappati`);
