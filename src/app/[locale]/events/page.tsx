import { getTranslations, setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventsGrid } from "@/components/events/EventsGrid";
import { fetchEvents, mapApiEvent, type ApiEventStatus } from "@/api/events";
import type { EventStatus } from "@/types/events";

export const revalidate = 300;

const PAGE_SIZE = 6;

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
  const rawPage = Number(Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1"));
  const rawFilter = (Array.isArray(sp.filter) ? sp.filter[0] : sp.filter) ?? "all";
  const rawQuery = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const filter: FilterKey =
    ["all", "ongoing", "upcoming", "past"].includes(rawFilter)
      ? (rawFilter as FilterKey)
      : "all";
  const query = rawQuery.trim().slice(0, 100);
  const currentPage = Math.max(1, isNaN(rawPage) ? 1 : rawPage);

  const t = await getTranslations("EventsPage");


  const [countsAll, countsOngoing, countsUpcoming, countsPast, spotlightRes, pageRes] =
    await Promise.all([
      fetchEvents({ page_size: 1 }),
      fetchEvents({ status: "ongoing", page_size: 1 }),
      fetchEvents({ status: "upcoming", page_size: 1 }),
      fetchEvents({ status: "finished", page_size: 1 }),
      fetchEvents({ page_size: 5 }),
      fetchEvents({
        status: filter === "all" ? undefined : filterToApiStatus[filter],
        search: query || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      }),
    ]);

  const counts: Record<FilterKey, number> = {
    all: countsAll.count,
    ongoing: countsOngoing.count,
    upcoming: countsUpcoming.count,
    past: countsPast.count,
  };

  const spotlightEvents = spotlightRes.results.map(mapApiEvent);

  const totalCount = pageRes.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageEvents = pageRes.results.map(mapApiEvent);

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