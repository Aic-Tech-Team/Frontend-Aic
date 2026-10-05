import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventsGrid } from "@/components/events/EventsGrid";
import {
  fetchEvents,
  mapApiEvent,
  type ApiEvent,
  type ApiEventStatus,
} from "@/services/api/events";
import type { PaginatedResponse } from "@/services/api/types";
import type { EventStatus } from "@/types/events";

export const revalidate = 300;

const PAGE_SIZE = 6;
const SPOTLIGHT_SIZE = 5;

const EMPTY: PaginatedResponse<ApiEvent> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

function resultsOf(res: PaginatedResponse<ApiEvent>) {
  return Array.isArray(res?.results) ? res.results : [];
}

type FilterKey = "all" | EventStatus;

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
  const page = Math.max(
    1,
    Number(Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1")) || 1,
  );
  const rawFilter =
    (Array.isArray(sp.filter) ? sp.filter[0] : sp.filter) ?? "all";
  const filter: FilterKey = ["all", "ongoing", "upcoming", "past"].includes(
    rawFilter,
  )
    ? (rawFilter as FilterKey)
    : "all";
  const search = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "")
    .trim()
    .slice(0, 100);

  const t = await getTranslations("EventsPage");

  const pageRes = await fetchEvents({
    status: filter === "all" ? undefined : filterToApiStatus[filter],
    search: search || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  if (!pageRes) {
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

  const spotlightRes =
    (await fetchEvents({ page_size: SPOTLIGHT_SIZE })) ?? EMPTY;

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const events = resultsOf(pageRes).map(mapApiEvent);
  const spotlightEvents = resultsOf(spotlightRes).map(mapApiEvent);

  function buildPageHref(pageNumber: number): string {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (filter !== "all") params.set("filter", filter);
    if (pageNumber !== 1) params.set("page", String(pageNumber));
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
          search={search}
          selectedFilter={filter}
        >
          <EventsGrid
            events={events}
            totalCount={totalCount}
            currentPage={Math.min(page, totalPages)}
            pageSize={PAGE_SIZE}
            buildPageHref={buildPageHref}
          />
        </EventsExplorer>
      </div>
    </div>
  );
}
