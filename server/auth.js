"use strict";

const crypto = require("crypto");

const COOKIE = "daf_admin";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

function secret() {
  return process.env.AUTH_SECRET || "derived:" + (process.env.ADMIN_PASSWORD || "");
}

function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

function makeToken() {
  const payload = String(Date.now() + TTL_MS);
  return payload + "." + sign(payload);
}

function verifyToken(token) {
  if (typeof token !== "string") return false;
  const i = token.indexOf(".");
  if (i < 1) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(String(pw || ""));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const k = part.slice(0, i).trim();
    let v = part.slice(i + 1).trim();
    try { v = decodeURIComponent(v); } catch (_) { /* lascia com'è */ }
    out[k] = v;
  }
  return out;
}

function isAuthed(req) {
  return verifyToken(parseCookies(req)[COOKIE]);
}

module.exports = { COOKIE, TTL_MS, makeToken, checkPassword, isAuthed };
