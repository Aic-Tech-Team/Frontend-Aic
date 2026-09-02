import { api } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/config";
import { ApiResponse } from "@/types";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

export type ApiEventType =
  | "competition"
  | "workshop"
  | "seminar"
  | "meeting"
  | "course";

export type ApiEventStatus = "upcoming" | "ongoing" | "finished";

export interface ListEventsParams {
  event_type?: ApiEventType;
  status?: ApiEventStatus;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiEvent {
  id: string | number;
  title: string;
  short_description?: string;
  description?: string;
  event_type: ApiEventType;
  status: ApiEventStatus;
  location?: string;
  organizer?: string;
  start_at: string;
  end_at: string;
  seats_left?: number | null;
  image?: string | null;
  gallery?: string[];
}

export async function fetchEvents(params: ListEventsParams = {}) {
  return api<ApiResponse<PaginatedResponse<ApiEvent>>>(
    apiEndpoints.events.list(),
    { params: { ...params }, revalidate: 300 },
  );
}

export async function fetchEvent(id: string | number) {
  return api<ApiResponse<ApiEvent>>(apiEndpoints.events.detail(id), {
    revalidate: 300,
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
    organizer: event.organizer,
    location: event.location ?? "",
    dateLabel: buildDateLabel(event.start_at, event.end_at),
    startAt: event.start_at,
    endAt: event.end_at,
    seatsLeft: event.seats_left ?? null,
    image:
      event.image && event.image.trim()
        ? event.image
        : "/images/placeholder.jpg",
    gallery: event.gallery?.filter(Boolean) ?? [],
    desc: event.description ?? "",
    status: apiStatusToStatus[event.status],
  };
}

function buildDateLabel(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const date = start.toLocaleDateString();
  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${startTime}–${endTime}`;
}
