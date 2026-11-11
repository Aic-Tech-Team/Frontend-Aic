import { getLocale } from "next-intl/server";
import { ActivitiesGrid } from "@/components/activities/ActivitiesGrid";
import { EventsLoadError } from "@/components/events/EventsLoadError";
import { fetchActivities, mapApiActivity } from "@/services/api/activities";
import { pageRows } from "@/services/api/types";
import { pageHref } from "@/lib/search-params";

export const ACTIVITIES_PAGE_SIZE = 8;

/**
 * The list itself, fetched on its own so the header and the filters render at once and this part
 * streams in (the page keys a Suspense on category, search and page). The fetch gives up after a
 * few seconds instead of hanging, and a failure is shown here, in place.
 */
export async function ActivitiesResults({
  category,
  search,
  page,
}: {
  category: string;
  search: string;
  page: number;
}) {
  const locale = await getLocale();
  const filtered = category !== "all" || Boolean(search);

  const res = await fetchActivities(
    {
      category: category === "all" ? undefined : category,
      search: search || undefined,
      page,
      page_size: ACTIVITIES_PAGE_SIZE,
    },
    { revalidate: 300 },
  );

  if (!res) return <EventsLoadError clearHref={filtered ? "/activities" : undefined} />;

  const totalCount = res.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ACTIVITIES_PAGE_SIZE));
  const query = {
    q: search || undefined,
    category: category === "all" ? undefined : category,
  };

  return (
    <ActivitiesGrid
      activities={pageRows(res).map((r) => mapApiActivity(r, locale))}
      totalCount={totalCount}
      currentPage={Math.min(page, totalPages)}
      pageSize={ACTIVITIES_PAGE_SIZE}
      buildPageHref={(p) => pageHref(query, p)}
    />
  );
}
