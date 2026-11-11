import { getLocale } from "next-intl/server";
import { EventFeatured } from "@/components/events/EventFeatured";
import { fetchEvents, mapApiEvent } from "@/services/api/events";
import { pageRows } from "@/services/api/types";

/**
 * The event to put first: whatever is running, else the nearest one still to come, taken from the
 * first five events. Renders nothing if they cannot be fetched or none qualifies.
 */
export async function EventsFeatured() {
  const locale = await getLocale();
  const events = pageRows(await fetchEvents({ page_size: 5 })).map((r) =>
    mapApiEvent(r, locale),
  );

  const featured =
    events.find((e) => e.status === "ongoing") ??
    events
      .filter((e) => e.status === "upcoming")
      .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];

  return featured ? <EventFeatured event={featured} /> : null;
}
