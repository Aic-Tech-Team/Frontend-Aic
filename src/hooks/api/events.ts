import type { ApiResponse } from "@/types";
import { api } from "@/services/api/client";
import { apiEndpoints, getApiConfig } from "@/services/api/config";
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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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

export async function fetchEvents(params: ListEventsParams = {}) {
  return api<ApiResponse<PaginatedResponse<ApiEvent>>>(
    apiEndpoints.events.list(),
    {
      params,
      revalidate: 300,
    },
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
    location: event.location ?? "",
    dateLabel: buildDateLabel(event.event_date),
    startAt: event.event_date,
    endAt: event.event_date,
    seatsLeft: null,
    image: resolveEventImage(event.image),
    desc: event.short_description || event.description || "",
    fullDesc: event.description,
    registrationLink: event.registration_link ?? undefined,
    status: apiStatusToStatus[event.status],
  };
}

function resolveEventImage(image: string | null | undefined): string {
  if (!image) return "/images/qq.jpg"; // Default placeholder image
  if (/^https?:\/\//i.test(image)) return image;

  const { apiBaseUrl } = getApiConfig();
  return apiBaseUrl ? new URL(image, `${apiBaseUrl}/`).toString() : image;
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
