const DEFAULT_API_VERSION = "1.0";

/**
 * `NEXT_PUBLIC_*` is inlined at `next build`. Server fetches must not depend on
 * that value: inside Docker the public origin often cannot be reached (hairpin).
 * `API_BASE_URL` is read at runtime. Bracket access is intentional so the
 * compiler does not inline it.
 */
function readRuntimeEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim().replace(/\/$/, "") : "";
}

/** Browser-facing origin for media URLs. */
export function getPublicApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

/** Origin the Next server uses for API fetches. Falls back to the public URL. */
export function getServerApiBaseUrl(): string {
  return readRuntimeEnv("API_BASE_URL") || getPublicApiBaseUrl();
}

function getApiVersionSegment(): string {
  const raw = (process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION).trim();
  // Accept "1", "1.0", "v1" — backend only serves v1 (anything else 404s).
  const match = raw.match(/^v?(\d+)/i);
  const major = match ? Number(match[1]) : NaN;
  return `v${Number.isFinite(major) ? Math.trunc(major) : 1}`;
}

function base(): string {
  const baseUrl = getServerApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "API_BASE_URL / NEXT_PUBLIC_API_BASE_URL is not set — API URL cannot be built.",
    );
  }
  return `${baseUrl}/${getApiVersionSegment()}`;
}

export function getApiConfig() {
  return {
    apiBaseUrl: getPublicApiBaseUrl(),
    serverApiBaseUrl: getServerApiBaseUrl(),
    apiVersion: getApiVersionSegment(),
  };
}

export const apiEndpoints = {
  events: {
    list: () => `${base()}/events/`,
    detail: (id: number | string) =>
      `${base()}/events/${encodeURIComponent(String(id))}/`,
  },
  blogs: {
    list: () => `${base()}/blogs/`,
    detail: (id: number | string) =>
      `${base()}/blogs/${encodeURIComponent(String(id))}/`,
  },
  activities: {
    list: () => `${base()}/activities/`,
    detail: (id: number | string) =>
      `${base()}/activities/${encodeURIComponent(String(id))}/`,
  },
  teams: {
    list: () => `${base()}/organization/teams/`,
    detail: (id: number | string) =>
      `${base()}/organization/teams/${encodeURIComponent(String(id))}/`,
  },
} as const;
