import { api } from "@/services/api/client";
import { apiEndpoints, getApiConfig } from "@/services/api/config";
import type { ActivityItem } from "@/types/activity";

export interface PaginatedActivitiesResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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

export async function fetchActivities(
  params: ListActivitiesParams = {},
): Promise<PaginatedActivitiesResponse<ApiActivity>> {
  return api<PaginatedActivitiesResponse<ApiActivity>>(
    apiEndpoints.activities.list(),
    {
      params,
      revalidate: 300,
    },
  );
}

export async function fetchActivity(
  id: string | number,
): Promise<ApiActivity> {
  return api<ApiActivity>(apiEndpoints.activities.detail(id), {
    revalidate: 300,
  });
}

export function mapApiActivity(activity: ApiActivity): ActivityItem {
  const startAt = activity.start_date ?? activity.created_at ?? "";

  return {
    id: String(activity.id),
    category: activity.category ?? "",
    title: activity.title,
    image: resolveActivityImage(activity.image),
    summary:
      activity.short_description ?? activity.description?.slice(0, 160) ?? "",
    content: activity.description ?? undefined,
    dateLabel: formatActivityDate(startAt),
  };
}

function resolveActivityImage(image: string | null | undefined): string {
  if (!image) return "/images/qq.jpg";
  if (/^https?:\/\//i.test(image)) return image;

  const { apiBaseUrl } = getApiConfig();
  return apiBaseUrl ? new URL(image, `${apiBaseUrl}/`).toString() : image;
}

function formatActivityDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}
