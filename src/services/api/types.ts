export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function pageRows<T>(page: PaginatedResponse<T> | null | undefined): T[] {
  return Array.isArray(page?.results) ? page.results : [];
}
