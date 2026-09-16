

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** Query params appended to the URL — undefined/empty values are skipped. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON body — auto-serialized */
  body?: unknown;
  /** Next.js data-cache revalidate window, in seconds. */
  revalidate?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly url: string;

  constructor(status: number, data: unknown, url: string) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `Request failed with status ${status}`;

    super(message);
    this.name = `HttpError${status}`;
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

function buildUrl(url: string, params?: ApiRequestOptions["params"]): string {
  if (!params) return url;
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (entries.length === 0) return url;
  // `url` is absolute in practice, but tolerate a relative base (e.g. tests
  // or missing env) by falling back to manual query-string construction.
  try {
    const withParams = new URL(url);
    for (const [key, value] of entries) {
      withParams.searchParams.set(key, String(value));
    }
    return withParams.toString();
  } catch {
    const qs = entries
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
      .join("&");
    return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

/**
 * In-flight deduplication for identical concurrent GETs.
 * 100 rapid clicks on the same section share 1 network request
 * instead of firing 100. Entries are removed on settle, so
 * sequential (non-overlapping) calls still fetch fresh data
 * per React Query's staleTime/GC policy.
 */
const inflightRequests = new Map<string, Promise<unknown>>();

function isDedupable(method: string | undefined, body: unknown): boolean {
  return (method === undefined || method.toUpperCase() === "GET") && body === undefined;
}

export async function api<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, body, revalidate, headers, ...init } = options;
  const finalUrl = buildUrl(url, params);

  if (!isDedupable(init.method, body)) {
    return fetchAndParse<T>(finalUrl, headers, init, body, revalidate);
  }

  const key = `GET ${finalUrl}`;
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const request = fetchAndParse<T>(finalUrl, headers, init, body, revalidate).finally(
    () => {
      if (inflightRequests.get(key) === request) inflightRequests.delete(key);
    },
  );

  inflightRequests.set(key, request);
  return request;
}

async function fetchAndParse<T>(
  finalUrl: string,
  headers: ApiRequestOptions["headers"],
  init: Omit<RequestInit, "body" | "headers">,
  body: unknown,
  revalidate: number | undefined,
): Promise<T> {

  const response = await fetch(finalUrl, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data, finalUrl);
  }

  return data as T;
}