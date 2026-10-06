/**
 * Probe the public API URL from .env the same way the Next server does (Node fetch).
 * Usage: pnpm api:check
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));

const publicBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
const versionRaw = (process.env.NEXT_PUBLIC_API_VERSION || "1.0").trim();
const majorMatch = versionRaw.match(/^v?(\d+)/i);
const version = `v${majorMatch ? majorMatch[1] : "1"}`;

if (!publicBase) {
  console.error("FAIL: NEXT_PUBLIC_API_BASE_URL is not set");
  process.exit(1);
}

const endpoints = [
  "events",
  "activities",
  "blogs",
  "organization/teams",
].map((path) => `${publicBase}/${version}/${path}/?page_size=1`);

console.log("public:", publicBase);
console.log("---");

const TIMEOUT_MS = 15000;
let failed = 0;

for (const url of endpoints) {
  const started = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { Accept: "application/json" },
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      failed += 1;
      console.log(`FAIL ${ms}ms HTTP ${res.status}  ${url}`);
      continue;
    }
    const json = await res.json();
    const count = Array.isArray(json?.results) ? json.results.length : "?";
    console.log(`OK   ${ms}ms HTTP ${res.status}  results=${count}  ${url}`);
  } catch (error) {
    failed += 1;
    const ms = Date.now() - started;
    const name = error?.name || "Error";
    const message = error?.message || String(error);
    console.log(`FAIL ${ms}ms ${name}: ${message}`);
    console.log(`      ${url}`);
  } finally {
    clearTimeout(timer);
  }
}

console.log("---");
if (failed) {
  console.error(
    `RESULT: ${failed}/${endpoints.length} failed. Frontend soft-fails → empty / ContentUnavailable. Fix network or point NEXT_PUBLIC_API_BASE_URL at a reachable backend.`,
  );
  process.exit(1);
}

console.log("RESULT: all endpoints reachable");
