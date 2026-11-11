import { getTranslations } from "next-intl/server";
import { CalendarSearch } from "lucide-react";
import { RevealItem } from "@/components/animations/Reveal";
import { ActivityTicketCard } from "@/components/activities/ActivityTicketCard";
import { ActivitiesResultsCount } from "@/components/activities/ActivitiesResultsCount";
import { ListPagination } from "@/components/common/ListPagination";
import type { ActivityItem } from "@/types/activity";

interface ActivitiesGridProps {
  activities: ActivityItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  buildPageHref: (page: number) => string;
}

/** Server Component — titles land in the HTML for crawlers / View Source. */
export async function ActivitiesGrid({
  activities,
  totalCount,
  currentPage,
  pageSize,
  buildPageHref,
}: ActivitiesGridProps) {
  const t = await getTranslations("ActivitiesPage");

  if (activities.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
        <CalendarSearch className="h-10 w-10 text-primary-300" />
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {t("noResultsTitle")}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("noResultsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ActivitiesResultsCount count={totalCount} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        {activities.map((activity, index) => (
          <RevealItem
            key={activity.id}
            direction="up"
            delay={(index % 4) * 0.05}
            fade={0.35}
            className="h-full"
          >
            <ActivityTicketCard activity={activity} index={index} />
          </RevealItem>
        ))}
      </div>
      <ListPagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        buildPageHref={buildPageHref}
      />
    </>
  );
}
