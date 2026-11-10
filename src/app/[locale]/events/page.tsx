import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { EventFeaturedSkeleton } from "@/components/events/EventFeaturedSkeleton";
import { EventsFeatured } from "@/components/events/EventsFeatured";
import { EventsHero } from "@/components/events/EventsHero";
import { EventsResults } from "@/components/events/EventsResults";
import { EventsResultsSkeleton } from "@/components/events/EventsResultsSkeleton";
import { pageNumber, param, searchQuery } from "@/lib/search-params";
import type { EventStatus } from "@/types/events";

export const dynamic = "force-dynamic";

type FilterKey = "all" | EventStatus;

/**
 * The shell (header, filters) renders without waiting on the API. The highlighted event and the
 * list each stream in inside their own Suspense, and the list's is keyed on filter, search and page
 * so changing any of them shows a skeleton at once instead of freezing the old list.
 */
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

  // the highlight belongs to the unfiltered first view only
  const showFeatured = filter === "all" && !search && page === 1;

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <EventsHero />
        <EventsExplorer
          search={search}
          selectedFilter={filter}
          featured={
            showFeatured ? (
              <Suspense fallback={<EventFeaturedSkeleton />}>
                <EventsFeatured />
              </Suspense>
            ) : null
          }
        >
          <Suspense
            key={`${filter}|${search}|${page}`}
            fallback={<EventsResultsSkeleton />}
          >
            <EventsResults filter={filter} search={search} page={page} />
          </Suspense>
        </EventsExplorer>
      </div>
    </div>
  );
}
