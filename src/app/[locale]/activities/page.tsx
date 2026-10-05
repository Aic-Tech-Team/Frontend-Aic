import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarClock } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { ActivitiesExplorer } from "@/components/activities/ActivitiesExplorer";
import { ActivitiesGrid } from "@/components/activities/ActivitiesGrid";
import {
  fetchActivities,
  mapApiActivity,
  type ApiActivity,
} from "@/services/api/activities";
import type { PaginatedResponse } from "@/services/api/types";

export const revalidate = 300;

const PAGE_SIZE = 8;
const DISCOVERY_SIZE = 20;

function resultsOf(res: PaginatedResponse<ApiActivity>) {
  return Array.isArray(res?.results) ? res.results : [];
}

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
  const page = Math.max(
    1,
    Number(Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1")) || 1,
  );
  const category =
    (Array.isArray(sp.category) ? sp.category[0] : sp.category) ?? "all";
  const search = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "")
    .trim()
    .slice(0, 100);

  const t = await getTranslations("ActivitiesPage");

  const pageRes = await fetchActivities({
    category: category === "all" ? undefined : category,
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
            icon={CalendarClock}
            title={t("title")}
            description={t("description")}
            align="center"
          />
          <ContentUnavailable className="mt-8" />
        </div>
      </div>
    );
  }

  const discoveryRes =
    (await fetchActivities({ page_size: DISCOVERY_SIZE })) ?? pageRes;

  const categories = Array.from(
    new Set(
      resultsOf(discoveryRes)
        .map((a) => a.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activities = resultsOf(pageRes).map(mapApiActivity);

  function buildPageHref(pageNumber: number): string {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);
    if (pageNumber !== 1) params.set("page", String(pageNumber));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={CalendarClock}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <ActivitiesExplorer
          categories={categories}
          search={search}
          selectedCategory={category}
        >
          <ActivitiesGrid
            activities={activities}
            totalCount={totalCount}
            currentPage={Math.min(page, totalPages)}
            pageSize={PAGE_SIZE}
            buildPageHref={buildPageHref}
          />
        </ActivitiesExplorer>
      </div>
    </div>
  );
}
