import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventsGrid } from "@/components/events/EventsGrid";
import {
  fetchEvents,
  mapApiEvent,
  type ApiEventStatus,
} from "@/services/api/events";
import { pageRows } from "@/services/api/types";
import { pageHref, pageNumber, param, searchQuery } from "@/lib/search-params";
import type { EventStatus } from "@/types/events";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;
const SPOTLIGHT_SIZE = 5;

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
  const page = pageNumber(sp);
  const rawFilter = param(sp, "filter") || "all";
  const filter: FilterKey = ["all", "ongoing", "upcoming", "past"].includes(
    rawFilter,
  )
    ? (rawFilter as FilterKey)
    : "all";
  const search = searchQuery(sp);

  const t = await getTranslations("EventsPage");

  const [pageRes, spotlightFetched] = await Promise.all([
    fetchEvents({
      status: filter === "all" ? undefined : filterToApiStatus[filter],
      search: search || undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    fetchEvents({ page_size: SPOTLIGHT_SIZE }),
  ]);

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

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const events = pageRows(pageRes).map((r) => mapApiEvent(r, locale));
  const spotlightEvents = pageRows(spotlightFetched).map((r) =>
    mapApiEvent(r, locale),
  );

  function buildPageHref(nextPage: number): string {
    return pageHref(
      {
        q: search || undefined,
        filter: filter === "all" ? undefined : filter,
      },
      nextPage,
    );
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
