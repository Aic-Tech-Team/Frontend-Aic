"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, CalendarSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RevealItem } from "@/components/animations/Reveal";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

function sortByStartAsc(a: EventItemWithStatus, b: EventItemWithStatus) {
  return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
}

function sortByStartDesc(a: EventItemWithStatus, b: EventItemWithStatus) {
  return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
}

export function EventsExplorer({ events }: { events: EventItemWithStatus[] }) {
  const t = useTranslations("EventsPage");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

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

      const haystack = [event.title, event.speaker, event.desc, event.location, event.category]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return haystack.includes(term);
    });

    if (filter === "past") return filtered.sort(sortByStartDesc);
    if (filter !== "all") return filtered.sort(sortByStartAsc);

    const ongoing = filtered.filter((e) => e.status === "ongoing").sort(sortByStartAsc);
    const upcoming = filtered.filter((e) => e.status === "upcoming").sort(sortByStartAsc);
    const past = filtered.filter((e) => e.status === "past").sort(sortByStartDesc);
    return [...ongoing, ...upcoming, ...past];
  }, [events, filter, query]);

  const hasSearchOrFilter = query.trim().length > 0 || filter !== "all";

  return (
    <div>
      <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(sanitizeSearchInput(event.target.value, SEARCH_MAX_LENGTH))
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
          {results.map((event, index) => (
            <RevealItem key={event.id} direction="up" delay={(index % 4) * 0.05} className="h-full">
              <EventTicketCard event={event} index={index} />
            </RevealItem>
          ))}
        </div>
      ) : (
        <div className="surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
          <CalendarSearch className="h-10 w-10 text-primary-300" />
          <div>
            <h3 className="text-lg font-bold text-foreground">{t("noResultsTitle")}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("noResultsDesc")}</p>
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
