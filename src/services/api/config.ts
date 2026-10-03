const DEFAULT_API_VERSION = "1.0";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

/**
 * Base URL used for the actual fetch.
 *
 * On the server this is NOT the public URL. The container sits behind the
 * host's nginx, so reaching its own public hostname means going out to public
 * DNS and hairpinning back — which hangs until the connect times out and turns
 * every server-rendered route into a 500. `API_INTERNAL_BASE_URL` points at the
 * backend over the shared docker network instead (e.g. http://app-backend:8000/api).
 *
 * Deliberately not NEXT_PUBLIC_*: it must be read at runtime and must never
 * reach the browser bundle, where the hostname is meaningless.
 *
 * Falls back to the public URL when unset, so dev and non-container deploys
 * keep working unchanged.
 */
function getFetchBaseUrl(): string {
  if (typeof window === "undefined") {
    const internal = process.env.API_INTERNAL_BASE_URL?.replace(/\/$/, "");
    if (internal) return internal;
  }
  return getApiBaseUrl();
}

/** The internal base URL, or "" when unset (browser, or non-container deploys). */
export function getInternalApiBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_INTERNAL_BASE_URL?.replace(/\/$/, "") ?? "";
}

function getApiVersionSegment(): string {
  const raw = (process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION).trim();
  // Accept "1", "1.0", "v1" — backend only serves v1 (anything else 404s).
  const match = raw.match(/^v?(\d+)/i);
  const major = match ? Number(match[1]) : NaN;
  return `v${Number.isFinite(major) ? Math.trunc(major) : 1}`;
}

function base(): string {
  const baseUrl = getFetchBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — API URL cannot be built.",
    );
  }
  return `${baseUrl}/${getApiVersionSegment()}`;
}

/**
 * `apiBaseUrl` here is always the PUBLIC url, never the internal one.
 *
 * Its only consumer is resolveMediaUrl (services/api/media.ts), which turns whatever
 * the API reports for an image into a browser-facing <img src>. Pointing this at the
 * internal host would emit src attributes no browser can resolve.
 */
export function getApiConfig() {
  return {
    apiBaseUrl: getApiBaseUrl(),
    apiVersion: getApiVersionSegment(),
  };
}

export const apiEndpoints = {
  events: {
    list: () => `${base()}/events/`,
    detail: (id: number | string) => `${base()}/events/${encodeURIComponent(String(id))}/`,
  },
  blogs: {
    list: () => `${base()}/blogs/`,
    detail: (id: number | string) => `${base()}/blogs/${encodeURIComponent(String(id))}/`,
  },
  activities: {
    list: () => `${base()}/activities/`,
    detail: (id: number | string) => `${base()}/activities/${encodeURIComponent(String(id))}/`,
  },
  teams: {
    list: () => `${base()}/organization/teams/`,
    detail: (id: number | string) =>
      `${base()}/organization/teams/${encodeURIComponent(String(id))}/`,
  },
} as const;
