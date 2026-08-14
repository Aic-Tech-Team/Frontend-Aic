"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, X, CalendarSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RevealItem } from "@/components/animations/Reveal";
import { Carousel } from "@/components/common/Carousel";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;
const PAGE_SIZE = 6;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

/** Builds a compact page list with `null` standing in for an ellipsis. */
function getPaginationRange(current: number, total: number): (number | null)[] {
  const siblings = 1;
  const range: (number | null)[] = [];

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);

  range.push(1);
  if (start > 2) range.push(null);
  for (let page = start; page <= end; page += 1) range.push(page);
  if (end < total - 1) range.push(null);
  if (total > 1) range.push(total);

  return range;
}

function sortByStartAsc(a: EventItemWithStatus, b: EventItemWithStatus) {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
}

function sortByStartDesc(a: EventItemWithStatus, b: EventItemWithStatus) {
  return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
}

export function EventsExplorer({ events }: { events: EventItemWithStatus[] }) {
  const t = useTranslations("EventsPage");
  const locale = useLocale();
  const isFa = locale === "fa";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

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

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    const filtered = events.filter((event) => {
      if (filter !== "all" && event.status !== filter) return false;
      if (!term) return true;

      const haystack = [
        event.title,
        event.speaker,
        event.desc,
        event.location,
        event.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return haystack.includes(term);
    });

    if (filter === "past") return filtered.sort(sortByStartDesc);
    if (filter !== "all") return filtered.sort(sortByStartAsc);

    const ongoing = filtered
      .filter((e) => e.status === "ongoing")
      .sort(sortByStartAsc);
    const upcoming = filtered
      .filter((e) => e.status === "upcoming")
      .sort(sortByStartAsc);
    const past = filtered
      .filter((e) => e.status === "past")
      .sort(sortByStartDesc);
    return [...ongoing, ...upcoming, ...past];
  }, [events, filter, query]);

  const hasSearchOrFilter = query.trim().length > 0 || filter !== "all";

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const paginationRange = useMemo(
    () => getPaginationRange(page, totalPages),
    [page, totalPages],
  );

  return (
    <div>
      <div className="mb-6">
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
          options={{
            loop: false,
            slidesToScroll: 1,
          }}
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

      <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(
                sanitizeSearchInput(event.target.value, SEARCH_MAX_LENGTH),
              )
            }
            maxLength={SEARCH_MAX_LENGTH}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="ps-10 pe-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
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
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                filter === key
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

      <p className="mb-6 mt-5 text-sm text-muted-foreground">
        {t("resultsCount", { count: results.length })}
      </p>

      {results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
            {paginatedResults.map((event, index) => (
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

          {totalPages > 1 ? (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    label={isFa ? "صفحه قبلی" : "Previous page"}
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  />
                </PaginationItem>

                {paginationRange.map((pageNumber, index) =>
                  pageNumber === null ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pageNumber === page}
                        aria-label={
                          isFa
                            ? `رفتن به صفحه ${pageNumber}`
                            : `Go to page ${pageNumber}`
                        }
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber.toLocaleString(isFa ? "fa-IR" : "en-US")}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    label={isFa ? "صفحه بعدی" : "Next page"}
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      ) : (
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
          {hasSearchOrFilter ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              {t("clearFilters")}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
