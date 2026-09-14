const DEFAULT_API_VERSION = "1.0";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
}

function getApiVersionSegment(): string {
  const version = process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION;
  return `v${Math.trunc(Number(version))}`;
}

function base(): string {
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
  blogs: {
    list: () => `${base()}/blogs/`,
    detail: (id: number | string) => `${base()}/blogs/${id}/`,
  },
  activities: {
    list: () => `${base()}/activities/`,
    detail: (id: number | string) => `${base()}/activities/${id}/`,
  },
} as const;