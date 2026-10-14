export interface ApiRequestOptions extends Omit<RequestInit, "body" | "signal"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Next.js revalidate window (seconds). Omit for `cache: "no-store"`. */
  revalidate?: number;
  /** Cache tags for on-demand `revalidateTag`. */
  tags?: string[];
  /** Override default request timeout (ms). */
  timeoutMs?: number;
  /**
   * Extra attempts after timeout/network failure (not HTTP errors).
   * Default 1 → up to 2 total tries. Set 0 to disable.
   */
  retries?: number;
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

/** Discriminated result — never throws. Prefer this for SSR content reads. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: Error; notFound: boolean };

/** Public remote APIs often need more headroom than a LAN Docker hop. */
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 1;

function buildUrl(url: string, params?: ApiRequestOptions["params"]): string {
  if (!params) return url;
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (entries.length === 0) return url;
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

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

/**
 * Timeout aborts the same fetch the render is awaiting.
 * A separate timer would render the fallback while Next's fetch later
 * resolves and writes a different result into the Data Cache.
 * Next only persists HTTP 200, and it drops `signal` on background
 * revalidation, so an abort is not stored as a successful entry.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await fetch(url, { ...init, signal });
  } catch (error) {
    const timedOut =
      signal.aborted ||
      (error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError"));
    if (timedOut) {
      throw new Error(`API request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

function isRetryableTransportError(error: Error): boolean {
  return (
    error.message.includes("timed out") ||
    error.message.includes("could not be reached")
  );
}

async function requestJsonOnce<T>(
  url: string,
  options: ApiRequestOptions,
): Promise<{ data: T } | { error: Error }> {
  const { params, body, revalidate, tags, headers, cache, timeoutMs, retries, ...init } =
    options;
  void retries;
  const finalUrl = buildUrl(url, params);
  const ms = timeoutMs ?? REQUEST_TIMEOUT_MS;

  const baseInit: RequestInit = {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: revalidate !== undefined ? cache : (cache ?? "no-store"),
  };

  const nextOpts: { revalidate?: number; tags?: string[] } = {};
  if (revalidate !== undefined) nextOpts.revalidate = revalidate;
  if (tags?.length) nextOpts.tags = tags;

  const fetchInit =
    revalidate !== undefined || tags?.length
      ? ({ ...baseInit, next: nextOpts } as RequestInit & {
          next: { revalidate?: number; tags?: string[] };
        })
      : baseInit;

  let response: Response;
  try {
    response = await fetchWithTimeout(finalUrl, fetchInit, ms);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("timed out after")
        ? error.message
        : `API request to ${finalUrl} could not be reached`;
    return { error: new Error(message) };
  }

  const data = await parseBody(response);
  if (!response.ok) {
    return { error: new ApiError(response.status, data, finalUrl) };
  }
  return { data: data as T };
}

async function requestJson<T>(
  url: string,
  options: ApiRequestOptions,
): Promise<{ data: T } | { error: Error }> {
  const retries = options.retries ?? DEFAULT_RETRIES;
  let last: { data: T } | { error: Error } | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    last = await requestJsonOnce<T>(url, options);
    if ("data" in last) return last;
    if (!isRetryableTransportError(last.error) || attempt === retries) {
      return last;
    }
  }

  return last ?? { error: new Error(`API request to ${url} failed`) };
}

/** Never throws. Use for all SSR/public content reads. */
export async function apiResult<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const result = await requestJson<T>(url, options);
  if ("data" in result) return { ok: true, data: result.data };

  const notFound =
    result.error instanceof ApiError && result.error.status === 404;
  if (!notFound) {
    console.warn(`[api] ${result.error.message}`);
  }
  return { ok: false, error: result.error, notFound };
}

/**
 * Hard client — throws. Avoid in Server Components; prefer `apiResult` /
 * `apiSoft` so timeouts don't become Next route errors.
 */
export async function api<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const result = await apiResult<T>(url, options);
  if (!result.ok) throw result.error;
  return result.data;
}

/** Never throws — returns `null` on network / timeout / HTTP failure. */
export async function apiSoft<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T | null> {
  const result = await apiResult<T>(url, options);
  return result.ok ? result.data : null;
}
