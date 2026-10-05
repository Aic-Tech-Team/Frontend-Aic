export interface ApiRequestOptions extends Omit<RequestInit, "body" | "signal"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /** Next.js revalidate window (seconds). Omit for `cache: "no-store"`. */
  revalidate?: number;
  /** Override default request timeout (ms). */
  timeoutMs?: number;
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

const REQUEST_TIMEOUT_MS = 10000;

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
 * Race fetch vs timeout. Does not reject — callers choose throw vs soft-null.
 * Avoid AbortSignal with `next.revalidate` (conflicts in Next cache).
 */
async function fetchRace(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ response: Response } | { timedOut: boolean }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(url, init).then(
        (response) => ({ response }),
        () => ({ timedOut: false as const }),
      ),
      new Promise<{ timedOut: true }>((resolve) => {
        timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function requestJson<T>(
  url: string,
  options: ApiRequestOptions,
): Promise<{ data: T } | { error: Error }> {
  const { params, body, revalidate, headers, cache, timeoutMs, ...init } =
    options;
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

  const fetchInit =
    revalidate !== undefined
      ? ({ ...baseInit, next: { revalidate } } as RequestInit & {
          next: { revalidate: number };
        })
      : baseInit;

  const raced = await fetchRace(finalUrl, fetchInit, ms);
  if (!("response" in raced)) {
    return {
      error: new Error(
        `API request to ${finalUrl} ${
          raced.timedOut ? `timed out after ${ms}ms` : "could not be reached"
        }`,
      ),
    };
  }

  const data = await parseBody(raced.response);
  if (!raced.response.ok) {
    return { error: new ApiError(raced.response.status, data, finalUrl) };
  }
  return { data: data as T };
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
