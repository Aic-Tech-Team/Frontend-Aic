import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { EventsGrid } from "@/components/events/EventsGrid";
import { EventsResultsCount } from "@/components/events/EventsResultsCount";
import { EventsLoadError } from "@/components/events/EventsLoadError";
import {
  fetchEvents,
  mapApiEvent,
  type ApiEventStatus,
} from "@/services/api/events";
import { pageRows } from "@/services/api/types";
import { pageHref } from "@/lib/search-params";
import type { EventStatus } from "@/types/events";

export const EVENTS_PAGE_SIZE = 6;

type FilterKey = "all" | EventStatus;

const filterToApiStatus: Record<Exclude<FilterKey, "all">, ApiEventStatus> = {
  ongoing: "ongoing",
  upcoming: "upcoming",
  past: "finished",
};

/**
 * The list itself, fetched on its own so the header and the filters render at once and this part
 * streams in (the page keys a Suspense on filter, search and page). The fetch gives up after a few
 * seconds instead of hanging, and a failure is shown here, in place.
 */
export async function EventsResults({
  filter,
  search,
  page,
}: {
  filter: FilterKey;
  search: string;
  page: number;
}) {
  const locale = await getLocale();
  const filtered = filter !== "all" || Boolean(search);
  const clearHref = filtered ? "/events" : undefined;

  const res = await fetchEvents(
    {
      status: filter === "all" ? undefined : filterToApiStatus[filter],
      search: search || undefined,
      page,
      page_size: EVENTS_PAGE_SIZE,
    },
    { revalidate: 300, timeoutMs: 8000, retries: 0 },
  );

  if (!res) return <EventsLoadError clearHref={clearHref} />;

  const totalCount = res.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / EVENTS_PAGE_SIZE));
  const query = {
    q: search || undefined,
    filter: filter === "all" ? undefined : filter,
  };

  // a page number past the end (an old link, a shrunk list) goes to the last page that exists
  if (page > totalPages) {
    redirect({
      href: `/events${pageHref(query, totalCount > 0 ? totalPages : 1)}`,
      locale,
    });
  }

  const events = pageRows(res).map((r) => mapApiEvent(r, locale));

  return (
    <>
      <EventsResultsCount count={totalCount} />
      <EventsGrid
        events={events}
        totalCount={totalCount}
        currentPage={page}
        pageSize={EVENTS_PAGE_SIZE}
        buildPageHref={(p) => pageHref(query, p)}
        clearHref={clearHref}
      />
    </>
  );
}
