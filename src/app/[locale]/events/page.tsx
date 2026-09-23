import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventsGrid } from "@/components/events/EventsGrid";
import { ApiError } from "@/services/api/client";
import {
  fetchEvents,
  mapApiEvent,
  type ApiEvent,
  type ApiEventStatus,
  type PaginatedResponse,
} from "@/hooks/api/events";
import type { EventStatus } from "@/types/events";

export const revalidate = 300;

const PAGE_SIZE = 6;

const EMPTY_PAGE: PaginatedResponse<ApiEvent> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

/** Guards against a non-paginated or malformed payload reaching `.map`. */
function resultsOf(res: PaginatedResponse<ApiEvent>): ApiEvent[] {
  return Array.isArray(res?.results) ? res.results : [];
}

type FilterKey = "all" | EventStatus;

/** UI filter key = API status query value */
const filterToApiStatus: Record<Exclude<FilterKey, "all">, ApiEventStatus> = {
  ongoing: "ongoing",
  upcoming: "upcoming",
  past: "finished",
};

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;

  // Parse searchParams — always scalars
  const rawPage = Number(
    Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1"),
  );
  const rawFilter =
    (Array.isArray(sp.filter) ? sp.filter[0] : sp.filter) ?? "all";
  const rawQuery = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const filter: FilterKey = ["all", "ongoing", "upcoming", "past"].includes(
    rawFilter,
  )
    ? (rawFilter as FilterKey)
    : "all";
  const query = rawQuery.trim().slice(0, 100);
  const currentPage = Math.max(1, isNaN(rawPage) ? 1 : rawPage);

  const t = await getTranslations("EventsPage");

  // A ?page= past the last page returns 404 ("Invalid page") — show the empty
  // state rather than letting it become a 500.
  async function fetchPageRes() {
    try {
      return await fetchEvents({
        status: filter === "all" ? undefined : filterToApiStatus[filter],
        search: query || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return EMPTY_PAGE;
      throw error;
    }
  }

  let countsAll: PaginatedResponse<ApiEvent>;
  let countsOngoing: PaginatedResponse<ApiEvent>;
  let countsUpcoming: PaginatedResponse<ApiEvent>;
  let countsPast: PaginatedResponse<ApiEvent>;
  let spotlightRes: PaginatedResponse<ApiEvent>;
  let pageRes: PaginatedResponse<ApiEvent>;

  try {
    [
      countsAll,
      countsOngoing,
      countsUpcoming,
      countsPast,
      spotlightRes,
      pageRes,
    ] = await Promise.all([
      fetchEvents({ page_size: 1 }),
      fetchEvents({ status: "ongoing", page_size: 1 }),
      fetchEvents({ status: "upcoming", page_size: 1 }),
      fetchEvents({ status: "finished", page_size: 1 }),
      fetchEvents({ page_size: 5 }),
      fetchPageRes(),
    ]);
  } catch (error) {
    // Upstream unreachable or erroring — render the page shell with a fallback
    // rather than letting the throw become an opaque production 500.
    console.error("[events] failed to load events:", error);
    return (
      <div className="py-10 sm:py-16">
        <div className="container">
          <SectionHeading
            badge={t("badge")}
            icon={Ticket}
            title={t("title")}
            description={t("description")}
            align="center"
          />
          <ContentUnavailable className="mt-8" />
        </div>
      </div>
    );
  }

  const counts: Record<FilterKey, number> = {
    all: countsAll.count ?? 0,
    ongoing: countsOngoing.count ?? 0,
    upcoming: countsUpcoming.count ?? 0,
    past: countsPast.count ?? 0,
  };

  const spotlightEvents = resultsOf(spotlightRes).map(mapApiEvent);

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageEvents = resultsOf(pageRes).map(mapApiEvent);

  // Builds a URL for a given page, preserving the current filter and query.
  function buildPageHref(page: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", rawQuery.trim());
    if (filter !== "all") params.set("filter", filter);
    if (page !== 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Ticket}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <EventsExplorer
          spotlightEvents={spotlightEvents}
          counts={counts}
          totalCount={totalCount}
        >
          <EventsGrid
            events={pageEvents}
            totalCount={totalCount}
            currentPage={Math.min(currentPage, totalPages)}
            pageSize={PAGE_SIZE}
            locale={locale}
            buildPageHref={buildPageHref}
          />
        </EventsExplorer>
      </div>
    </div>
  );
}
