

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
  const withParams = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      withParams.searchParams.set(key, String(value));
    }
  }
  return withParams.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

export async function api<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, body, revalidate, headers, ...init } = options;
  const finalUrl = buildUrl(url, params);

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