import dns from "node:dns";

/** Prefer IPv4 — some hosts hang on IPv6-first resolution from Node. */
export async function register() {
  dns.setDefaultResultOrder("ipv4first");
}
