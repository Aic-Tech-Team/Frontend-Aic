const DEFAULT_API_VERSION = "1.0";

/**
 * Public API base (no trailing slash), e.g. https://host/api
 *
 * Used for all Server Component fetches and for resolving media URLs for the
 * browser. There is no separate internal URL — callers without a Docker-network
 * backend must hit the same public origin (Next.js does not require dual URLs;
 * optional internal bases are an ops concern only when a private hostname exists).
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function getApiVersionSegment(): string {
  const raw = (process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION).trim();
  // Accept "1", "1.0", "v1" — backend only serves v1 (anything else 404s).
  const match = raw.match(/^v?(\d+)/i);
  const major = match ? Number(match[1]) : NaN;
  return `v${Number.isFinite(major) ? Math.trunc(major) : 1}`;
}

function base(): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set — API URL cannot be built.",
    );
  }
  return `${baseUrl}/${getApiVersionSegment()}`;
}

export function getApiConfig() {
  return {
    apiBaseUrl: getApiBaseUrl(),
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
