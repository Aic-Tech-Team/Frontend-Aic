import { apiResult, ApiError } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { resolveMediaUrl } from "@/services/api/media";
import type { PaginatedResponse } from "@/services/api/types";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

export type ApiEventType =
  | "competition"
  | "workshop"
  | "seminar"
  | "meeting"
  | "course";

export type ApiEventStatus = "upcoming" | "ongoing" | "finished";

export type ListEventsParams = {
  event_type?: ApiEventType;
  status?: ApiEventStatus;
  search?: string;
  page?: number;
  page_size?: number;
};

export interface ApiEvent {
  id: number;
  title: string;
  event_type: ApiEventType;
  event_date: string;
  status: ApiEventStatus;
  short_description?: string;
  description?: string;
  image?: string | null;
  location?: string;
  registration_link?: string | null;
  created_at?: string;
  updated_at?: string;
}

const EMPTY: PaginatedResponse<ApiEvent> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export async function fetchEvents(
  params: ListEventsParams = {},
  opts: { revalidate?: number } = { revalidate: 300 },
): Promise<PaginatedResponse<ApiEvent> | null> {
  const result = await apiResult<PaginatedResponse<ApiEvent>>(
    apiEndpoints.events.list(),
    { params, revalidate: opts.revalidate },
  );
  if (result.ok) return result.data;
  if (result.notFound) return EMPTY;
  if (
    result.error instanceof ApiError &&
    result.error.status === 400 &&
    (params.status || params.event_type)
  ) {
    const { status: _s, event_type: _t, ...rest } = params;
    return fetchEvents(rest, opts);
  }
  return null;
}

export async function fetchEvent(
  id: string | number,
  opts: { revalidate?: number } = { revalidate: 300 },
) {
  return apiResult<ApiEvent>(apiEndpoints.events.detail(id), {
    revalidate: opts.revalidate,
  });
}

const apiStatusToStatus: Record<ApiEventStatus, EventStatus> = {
  upcoming: "upcoming",
  ongoing: "ongoing",
  finished: "past",
};

export function mapApiEvent(event: ApiEvent): EventItemWithStatus {
  return {
    id: String(event.id),
    category: event.event_type,
    title: event.title,
    location: event.location ?? "",
    dateLabel: buildDateLabel(event.event_date),
    startAt: event.event_date,
    endAt: event.event_date,
    image: resolveMediaUrl(event.image),
    desc: event.short_description || event.description || "",
    fullDesc: event.description,
    registrationLink: event.registration_link ?? undefined,
    status: apiStatusToStatus[event.status],
  };
}

function buildDateLabel(eventDate: string): string {
  const date = new Date(eventDate);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} · ${timeStr}`;
}
