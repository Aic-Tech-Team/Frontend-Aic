import { apiSoft } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { mapApiActivity, type ApiActivity } from "@/services/api/activities";
import { mapApiBlogPost, type ApiBlogPost } from "@/services/api/blogs";
import { mapApiEvent, type ApiEvent } from "@/services/api/events";
import { mapTeamRows, type ApiTeam } from "@/services/api/teams";
import type { PaginatedResponse } from "@/services/api/types";
import type { ActivityItem } from "@/types/activity";
import type { BlogPostItem } from "@/types/blog";
import type { EventItemWithStatus } from "@/types/events";
import type { TeamItem } from "@/types/team";

const PAGE_SIZE = 6;
const TIMEOUT_MS = 2500;

/**
 * `null` = API unreachable / soft-fail.
 * `[]` = reachable but empty.
 */
async function fetchList<T>(url: string): Promise<T[] | null> {
  const page = await apiSoft<PaginatedResponse<T>>(url, {
    params: { page_size: PAGE_SIZE },
    revalidate: 300,
    timeoutMs: TIMEOUT_MS,
  });
  if (page === null) return null;
  return Array.isArray(page.results) ? page.results : [];
}

export async function getLandingEvents(): Promise<EventItemWithStatus[] | null> {
  const rows = await fetchList<ApiEvent>(apiEndpoints.events.list());
  if (rows === null) return null;
  return rows.map(mapApiEvent);
}

export async function getLandingActivities(): Promise<ActivityItem[] | null> {
  const rows = await fetchList<ApiActivity>(apiEndpoints.activities.list());
  if (rows === null) return null;
  return rows.map(mapApiActivity);
}

export async function getLandingBlogPosts(): Promise<BlogPostItem[] | null> {
  const rows = await fetchList<ApiBlogPost>(apiEndpoints.blogs.list());
  if (rows === null) return null;
  return rows.map(mapApiBlogPost);
}

export async function getLandingTeams(): Promise<TeamItem[] | null> {
  const rows = await fetchList<ApiTeam>(apiEndpoints.teams.list());
  if (rows === null) return null;
  return mapTeamRows(rows);
}
