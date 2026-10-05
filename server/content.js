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

/* Torna la stringa con soli tag consentiti. Tutto il resto viene escaped.
   Allowlist: strong, em, i, br (anche class="br-desk"), span class="dot|opt",
   a href (http/https/mailto/#). I link con href diverso vengono scartati. */
function sanitizeValue(key, value) {
  let v = String(value == null ? "" : value);
  if (META[key].type === "text") {
    return v.trim();
  }
  v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  v = v.replace(/&lt;(\/?)(strong|em|br|i)( class="(br-desk|opt)")?( \/)?&gt;/g, (m, slash, tag, clsAttr, cls, self) => {
    return "<" + slash + tag + (clsAttr || "") + (self ? " /" : "") + ">";
  });
  v = v.replace(/&lt;span class="(dot|opt)"( \/)?&gt;/g, '<span class="$1">');
  v = v.replace(/&lt;\/span&gt;/g, "</span>");
  v = v.replace(/&lt;a href="([^"]*)"( class="[^"]*")?&gt;/g, (m, href, cls) => {
    if (!/^(https?:\/\/|mailto:|#|\/\/)/i.test(href)) return "";
    return '<a href="' + href.replace(/"/g, "%22") + '"' + (cls || "") + ">";
  });
  v = v.replace(/&lt;\/a&gt;/g, "</a>");
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
