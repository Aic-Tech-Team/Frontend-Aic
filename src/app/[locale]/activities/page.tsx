import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { ActivitiesExplorer } from "@/components/activities/ActivitiesExplorer";
import { ActivitiesHero } from "@/components/activities/ActivitiesHero";
import { ActivitiesResults } from "@/components/activities/ActivitiesResults";
import { ActivitiesResultsSkeleton } from "@/components/activities/ActivitiesResultsSkeleton";
import { fetchActivities } from "@/services/api/activities";
import { pageRows } from "@/services/api/types";
import { pageNumber, param, searchQuery } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const DISCOVERY_SIZE = 20;

/** The categories the filter bar offers, from the same rows. */
async function categoriesOf(): Promise<string[]> {
  const rows = pageRows(await fetchActivities({ page_size: DISCOVERY_SIZE }));
  return Array.from(
    new Set(rows.map((a) => a.category).filter((c): c is string => Boolean(c))),
  ).sort();
}

/**
 * The shell (header, filters) renders without waiting on the list. The list streams in inside its
 * own Suspense, keyed on category, search and page so changing any of them shows a skeleton at once
 * instead of freezing the old list.
 */
export default async function ActivitiesPage({
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
  const category = param(sp, "category") || "all";
  const search = searchQuery(sp);

  const categories = await categoriesOf();

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <ActivitiesHero />
        <ActivitiesExplorer
          categories={categories}
          search={search}
          selectedCategory={category}
        >
          <Suspense
            key={`${category}|${search}|${page}`}
            fallback={<ActivitiesResultsSkeleton />}
          >
            <ActivitiesResults category={category} search={search} page={page} />
          </Suspense>
        </ActivitiesExplorer>
      </div>
    </div>
  );
}
