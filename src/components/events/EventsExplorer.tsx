"use client";

import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/common/Carousel";
import { RevealItem } from "@/components/animations/Reveal";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import { useEventsQuery } from "@/hooks/api/use-events";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { ApiEventStatus } from "@/hooks/api/events";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;
const SEARCH_DEBOUNCE_MS = 300;
const LIVE_SEARCH_PAGE_SIZE = 12;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

/** UI filter key -> API `status` query value ("all" has no API equivalent). */
const filterToApiStatus: Record<Exclude<FilterKey, "all">, ApiEventStatus> = {
  ongoing: "ongoing",
  upcoming: "upcoming",
  past: "finished",
};

interface EventsExplorerProps {
  /** Top few events for the spotlight carousel — fetched separately, unrelated to the active filter/page. */
  spotlightEvents: EventItemWithStatus[];
  /** Per-status counts for the filter tab badges — fetched separately (the API is paginated, so we can't derive these from one page). */
  counts: Record<FilterKey, number>;
  /** Total events matching the current server-side filter/query (for the results label). */
  totalCount: number;
  /** Server-rendered grid + pagination passed in from the page. */
  children: React.ReactNode;
}

export function EventsExplorer({
  spotlightEvents,
  counts,
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

  // Local, instant input state — typing here never blocks on the network or
  // a server round-trip. Only the *debounced* value below triggers a fetch.
  const [searchInput, setSearchInput] = useState(currentQuery);
  const debouncedSearch = useDebounce(
    sanitizeSearchInput(searchInput, SEARCH_MAX_LENGTH),
    SEARCH_DEBOUNCE_MS,
  );
  const isLiveSearchActive = debouncedSearch.trim().length > 0;

  // Client-side, TanStack Query-powered live search — only runs once the
  // debounce settles, so a fast typist never fires a request per keystroke.
  const {
    events: liveEvents,
    count: liveCount,
    isLoading: isLiveSearchLoading,
  } = useEventsQuery(
    {
      search: debouncedSearch || undefined,
      status: currentFilter === "all" ? undefined : filterToApiStatus[currentFilter],
      page_size: LIVE_SEARCH_PAGE_SIZE,
    },
    { enabled: isLiveSearchActive },
  );

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
    setSearchInput("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const hasSearchOrFilter =
    searchInput.trim().length > 0 || currentFilter !== "all";

  const resultsCount = isLiveSearchActive ? liveCount : totalCount;

  return (
    <div>
      {/* Spotlight carousel — always shows top 5 events regardless of filter */}
      <div className="mb-6">
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
          options={{ loop: false, slidesToScroll: 1 }}
        >
          {spotlightEvents.slice(0, 5).map((event, index) => (
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
          {isLiveSearchLoading ? (
            <Loader2 className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            maxLength={SEARCH_MAX_LENGTH}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="ps-10 pe-9"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
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
        {t("resultsCount", { count: resultsCount })}
      </p>

      {isLiveSearchActive ? (
        // Client-side live search results (TanStack Query, debounced) — no
        // pagination here by design, capped at LIVE_SEARCH_PAGE_SIZE.
        isLiveSearchLoading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-3xl bg-muted/50"
              />
            ))}
          </div>
        ) : liveEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
            {liveEvents.map((event, index) => (
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
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={handleClearAll}
            >
              {t("clearFilters")}
            </Button>
          </div>
        )
      ) : totalCount > 0 ? (
        // Server-rendered event grid + pagination (default browse mode)
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