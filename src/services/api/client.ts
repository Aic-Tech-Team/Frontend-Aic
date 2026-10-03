export interface ApiRequestOptions extends Omit<RequestInit, "body" | "signal"> {
  /** Query params appended to the URL — undefined/empty values are skipped. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON body — auto-serialized */
  body?: unknown;
  /**
   * Next.js data-cache revalidate window, in seconds.
   * Omit (or pass undefined) for `cache: "no-store"` (client / one-off fetches).
   */
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

/** Soft ceiling so a dead upstream cannot hang an RSC forever. */
const REQUEST_TIMEOUT_MS = 4000;

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

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

function timeoutError(url: string): Error {
  const error = new Error(
    `API request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`,
  );
  error.name = "TimeoutError";
  return error;
}

/**
 * Do not pass AbortSignal into Next's cached fetch — it conflicts with
 * `next.revalidate` and can blow the whole RSC into the error boundary.
 * Race a timer instead.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(url, init),
      new Promise<Response>((_, reject) => {
        timer = setTimeout(
          () => reject(timeoutError(url)),
          REQUEST_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function api<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, body, revalidate, headers, cache, ...init } = options;
  const finalUrl = buildUrl(url, params);

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

  let response: Response;
  try {
    response = await fetchWithTimeout(finalUrl, fetchInit);
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? `timed out after ${REQUEST_TIMEOUT_MS}ms`
        : "could not be reached";
    throw new Error(`API request to ${finalUrl} ${reason}`, { cause: error });
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data, finalUrl);
  }

  return data as T;
}
