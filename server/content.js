"use strict";

const { SECTIONS, DEFAULTS } = require("./content-defaults");

/* META: mappa chiave → { label, section, type }.
   type "rich": consenti solo i tag allowlistati in sanitizeValue;
   type "text": testo puro (l'escape e gli a-capo avvengono in renderValue). */
const META = Object.create(null);
for (const section of SECTIONS) {
  for (const k of section.keys) {
    META[k.key] = {
      label: k.label,
      section: section.label,
      type: k.def.indexOf("<") !== -1 ? "rich" : "text",
    };
  }
}

/* Torna la stringa con soli tag consentiti. Tutto il resto viene scartato
   (i tag restano escaped, quindi appaiono come testo e non come markup).
   Allowlist: strong, em, i, br (anche class="br-desk"), span class="dot|opt",
   a href (http/https/mailto/#). Attributi non previsti vengono rimossi. */
function sanitizeValue(key, value) {
  let v = String(value == null ? "" : value);
  if (META[key].type === "text") {
    return v.trim();
  }
  v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  v = v.replace(
    /&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^&]|&(?!gt;))*?)((?:\s*\/)?)&gt;/g,
    (m, slash, tag, attrs, self) => {
      tag = tag.toLowerCase();
      if (tag === "b") tag = "strong";
      if (tag === "br") {
        const c = /class="(br-desk|opt)"/.exec(attrs || "");
        return "<br" + (c ? ' class="' + c[1] + '"' : "") + (self ? " /" : "") + ">";
      }
      if (tag === "strong" || tag === "em" || tag === "i") {
        return "<" + slash + tag + ">";
      }
      if (tag === "span") {
        if (slash) return "</span>";
        const c2 = /class="(dot|opt)"/.exec(attrs || "");
        return c2 ? '<span class="' + c2[1] + '">' : "";
      }
      if (tag === "a") {
        if (slash) return "</a>";
        const h = /href="([^"]*)"/.exec(attrs || "");
        if (!h || !/^(https?:\/\/|mailto:|#|\/\/)/i.test(h[1])) return "";
        return '<a href="' + h[1].replace(/"/g, "%22") + '">';
      }
      /* div/p non consentiti: la chiusura diventa un a-capo, il contenuto resta */
      if (slash && (tag === "div" || tag === "p")) return "<br>";
      return "";
    }
  );
  /* niente orfani: se un'apertura è stata scartata, tolgo anche le chiusure */
  if (v.indexOf("<a ") === -1) v = v.replace(/<\/a>/g, "");
  if (v.indexOf("<span ") === -1) v = v.replace(/<\/span>/g, "");
  return v.trim();
}

/* HTML pronto per innerHTML nel frontend:
   - text: escape completo, a-capo in <br>;
   - rich: valore già sanitizzato (salvataggio) o default di fiducia (codice). */
function renderValue(meta, src) {
  if (meta.type === "rich") return src;
  return String(src)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .join("<br />");
}

module.exports = { SECTIONS, DEFAULTS, META, sanitizeValue, renderValue };
