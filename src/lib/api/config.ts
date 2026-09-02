
const DEFAULT_API_VERSION = "1.0";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function getApiVersionSegment(): string {
  const version = process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION;
  return `v${Math.trunc(Number(version))}`;
}

function base(): string {
  // NEXT_PUBLIC_API_BASE_URL already ends in /api (e.g. https://.../api) —
  // only append the version segment here, don't add /api again.
  return `${getApiBaseUrl()}/${getApiVersionSegment()}`;
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
    detail: (id: number | string) => `${base()}/events/${id}/`,
  },
} as const;