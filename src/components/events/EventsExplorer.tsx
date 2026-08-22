"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/common/Carousel";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

interface EventsExplorerProps {
  /** All events (unfiltered) — used only for the spotlight carousel and badge counts. */
  events: EventItemWithStatus[];
  /** Total events matching the current server-side filter/query (for the results label). */
  totalCount: number;
  /** Server-rendered grid + pagination passed in from the page. */
  children: React.ReactNode;
}

export function EventsExplorer({
  events,
  totalCount,
  children,
}: EventsExplorerProps) {
  const t = useTranslations("EventsPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") ?? "";
  const currentFilter = (searchParams.get("filter") ?? "all") as FilterKey;

  /** Build a new href preserving all current params, then overriding the given ones. */
  const buildHref = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Always reset to page 1 when search/filter changes
      params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      const sanitized = sanitizeSearchInput(value, SEARCH_MAX_LENGTH);
      startTransition(() => {
        router.push(buildHref({ q: sanitized || null }), { scroll: false });
      });
    },
    [buildHref, router],
  );

  const handleFilterChange = useCallback(
    (key: FilterKey) => {
      startTransition(() => {
        router.push(buildHref({ filter: key === "all" ? null : key }), {
          scroll: false,
        });
      });
    },
    [buildHref, router],
  );

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: events.length,
      ongoing: 0,
      upcoming: 0,
      past: 0,
    };
    for (const event of events) base[event.status] += 1;
    return base;
  }, [events]);

  const hasSearchOrFilter =
    currentQuery.trim().length > 0 || currentFilter !== "all";

  return (
    <div>
      {/* Spotlight carousel — always shows top 5 events regardless of filter */}
      <div className="mb-6">
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
          options={{ loop: false, slidesToScroll: 1 }}
        >
          {events.slice(0, 5).map((event, index) => (
            <div
              key={event.id}
              className="group relative h-52 overflow-hidden rounded-3xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(10,10,20,0.18), rgba(10,10,20,0.75)), url(${event.image})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-5">
                <span className="mb-2 w-fit rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {t(`status.${event.status}`)}
                </span>
                <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg">
                  {event.title}
                </h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">
                  {event.dateLabel}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/80">
                  <span className="rounded-full bg-white/10 px-2 py-1">
                    {event.category}
                  </span>
                  {index % 2 === 0 ? (
                    <span className="rounded-full bg-white/10 px-2 py-1">
                      {event.location}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Search + filter bar */}
      <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={currentQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="ps-10 pe-9"
          />
          {currentQuery ? (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              aria-label={t("clearFilters")}
              className="absolute end-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterChange(key)}
              aria-pressed={currentFilter === key}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                currentFilter === key
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(`filters.${key}`)}
              <span className="ms-1.5 opacity-70">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-6 mt-5 text-sm text-muted-foreground">
        {t("resultsCount", { count: totalCount })}
      </p>

      {/* Server-rendered event grid + pagination (or empty state) */}
      {totalCount > 0 ? (
        children
      ) : (
        <div className="surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
          <Search className="h-10 w-10 text-primary-300" />
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t("noResultsTitle")}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("noResultsDesc")}
            </p>
          </div>
          {hasSearchOrFilter ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleClearAll}
            >
              {t("clearFilters")}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
