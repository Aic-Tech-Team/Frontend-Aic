export type SearchParams = Record<string, string | string[] | undefined>;

export function param(sp: SearchParams, key: string): string {
  const value = sp[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function pageNumber(sp: SearchParams): number {
  const raw = Number(param(sp, "page") || "1");
  return Math.max(1, Number.isFinite(raw) ? raw : 1);
}

export function searchQuery(sp: SearchParams, max = 100): string {
  return param(sp, "q").trim().slice(0, max);
}

export function withQuery(
  pathname: string,
  query: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function pageHref(
  query: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}
