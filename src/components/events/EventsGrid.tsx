import { getTranslations } from "next-intl/server";
import { CalendarSearch } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { RevealItem } from "@/components/animations/Reveal";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import { ListPagination } from "@/components/common/ListPagination";
import type { EventItemWithStatus } from "@/types/events";

interface EventsGridProps {
  events: EventItemWithStatus[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  buildPageHref: (page: number) => string;
  /** When a filter or search is active: where "clear filters" goes. */
  clearHref?: string;
}

/** Server Component — titles land in the HTML for crawlers / View Source. */
export async function EventsGrid({
  events,
  totalCount,
  currentPage,
  pageSize,
  buildPageHref,
  clearHref,
}: EventsGridProps) {
  const t = await getTranslations("EventsPage");

  if (events.length === 0) {
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
        {clearHref ? (
          <Link
            href={clearHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
            )}
          >
            {t("clearFilters")}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event, index) => (
          <RevealItem
            key={event.id}
            direction="up"
            delay={(index % 4) * 0.05}
            className="h-full"
          >
            <EventTicketCard event={event} index={index} />
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
