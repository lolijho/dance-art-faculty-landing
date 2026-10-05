"use strict";

const postgres = require("postgres");

let sql = null;

function getSql() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL non impostata");
    sql = postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 });
  }
  return sql;
}

async function ensureSchema() {
  const s = getSql();
  await s`CREATE TABLE IF NOT EXISTS content (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
}

async function getOverrides() {
  const s = getSql();
  const rows = await s`SELECT key, value FROM content`;
  const out = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

async function saveOverrides(entries) {
  const s = getSql();
  await s`INSERT INTO content (key, value)
          ${s(entries, "key", "value")}
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = now()`;
}

module.exports = { getSql, ensureSchema, getOverrides, saveOverrides };
