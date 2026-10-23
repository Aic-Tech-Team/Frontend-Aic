export type EventStatus = "ongoing" | "upcoming" | "past";

export interface EventItem {
  id: string;
  category: string;
  title: string;
  speaker?: string;
  organizer?: string;
  location: string;
  /** Date only, localized. */
  dateLabel: string;
  /** Time only, localized. */
  timeLabel: string;
  /** Date and time, localized. */
  dateTimeLabel: string;
  startAt: string;
  endAt: string;
  image: string;
  gallery?: string[];
  desc: string;
  fullDesc?: string;
  /** External URL to register — from the API's `registration_link`. */
  registrationLink?: string;
}

export interface EventItemWithStatus extends EventItem {
  status: EventStatus;
}
