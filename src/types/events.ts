export type EventStatus = "ongoing" | "upcoming" | "past";

export interface EventItem {
  id: string;
  category: string;
  title: string;
  speaker?: string;
  organizer?: string;
  location: string;
  dateLabel: string;
  startAt: string;
  endAt: string;
  seatsLeft?: number | null;
  image: string;
  gallery?: string[];
  desc: string;
  fullDesc?: string;
  /** External URL to register — from the API's `registration_link`. Falls back to `/#join` when absent. */
  registrationLink?: string;
}

export interface EventItemWithStatus extends EventItem {
  status: EventStatus;
}

export function getEventStatus(
  startAt: string,
  endAt: string,
  nowIso: string
): EventStatus {
  const now = new Date(nowIso).getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (now < start) return "upcoming";
  if (now > end) return "past";
  return "ongoing";
}

export function withStatus(
  items: EventItem[],
  nowIso: string
): EventItemWithStatus[] {
  return items.map((item) => ({
    ...item,
    status: getEventStatus(item.startAt, item.endAt, nowIso),
  }));
}