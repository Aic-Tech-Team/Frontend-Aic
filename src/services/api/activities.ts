import { apiResult, ApiError } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { resolveMediaUrl } from "@/services/api/media";
import type { PaginatedResponse } from "@/services/api/types";
import type { ActivityItem } from "@/types/activity";

export type ListActivitiesParams = {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export interface ApiActivity {
  id: number | string;
  title: string;
  category?: string | null;
  short_description?: string | null;
  description?: string | null;
  image?: string | null;
  status?: string | null;
  start_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const EMPTY: PaginatedResponse<ApiActivity> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

/** Soft list — `null` = unreachable API; empty page = real empty / 404. */
export async function fetchActivities(
  params: ListActivitiesParams = {},
  opts: { revalidate?: number } = { revalidate: 300 },
): Promise<PaginatedResponse<ApiActivity> | null> {
  const result = await apiResult<PaginatedResponse<ApiActivity>>(
    apiEndpoints.activities.list(),
    { params, revalidate: opts.revalidate, tags: ["activities"] },
  );
  if (result.ok) return result.data;
  if (result.notFound) return EMPTY;
  if (
    result.error instanceof ApiError &&
    result.error.status === 400 &&
    params.category
  ) {
    const { category: _category, ...rest } = params;
    return fetchActivities(rest, opts);
  }
  return null;
}

/** Soft detail via ApiResult — never throws. */
export async function fetchActivity(
  id: string | number,
  opts: { revalidate?: number } = { revalidate: 300 },
) {
  return apiResult<ApiActivity>(apiEndpoints.activities.detail(id), {
    revalidate: opts.revalidate,
    tags: ["activities"],
  });
}

export function mapApiActivity(activity: ApiActivity): ActivityItem {
  const startAt = activity.start_date ?? activity.created_at ?? "";

  return {
    id: String(activity.id),
    category: activity.category ?? "",
    title: activity.title,
    image: resolveMediaUrl(activity.image),
    summary:
      activity.short_description ?? activity.description?.slice(0, 160) ?? "",
    content: activity.description ?? undefined,
    dateLabel: formatActivityDate(startAt),
  };
}

function formatActivityDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
