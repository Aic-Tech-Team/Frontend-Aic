"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RevealItem } from "@/components/animations/Reveal";
import { ActivityTicketCard } from "@/components/activities/ActivityTicketCard";
import { useActivitiesQuery } from "@/hooks/api/use-activities";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

const SEARCH_MAX_LENGTH = 100;
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 8;
const CATEGORY_DISCOVERY_SIZE = 100;
const ALL_CATEGORY = "all";


export function ActivitiesExplorer() {
  const t = useTranslations("ActivitiesPage");

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(
    sanitizeSearchInput(searchInput, SEARCH_MAX_LENGTH).trim(),
    SEARCH_DEBOUNCE_MS,
  );

  // Category discovery — a wide, unfiltered fetch mirroring BlogPage's
  // CATEGORY_DISCOVERY_SIZE pattern (the API is paginated, so categories
  // can't be derived from a single page of results).
  const { activities: discoveryActivities } = useActivitiesQuery({
    page_size: CATEGORY_DISCOVERY_SIZE,
  });

  const categories = useMemo(
    () =>
      Array.from(
        new Set(discoveryActivities.map((a) => a.category).filter(Boolean)),
      ).sort(),
    [discoveryActivities],
  );

  const {
    activities: pageActivities,
    count: totalCount,
    isLoading,
    isError,
    refetch,
  } = useActivitiesQuery({
    category: category === ALL_CATEGORY ? undefined : category,
    search: debouncedSearch || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const hasSearchOrFilter =
    debouncedSearch.length > 0 || category !== ALL_CATEGORY;

  function handleClearAll() {
    setSearchInput("");
    setCategory(ALL_CATEGORY);
    setPage(1);
    void refetch();
  }

  return (
    <div>
      {/* Search + category filter bar */}
      <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
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

        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory(ALL_CATEGORY);
                setPage(1);
              }}
              aria-pressed={category === ALL_CATEGORY}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                category === ALL_CATEGORY
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t("filters.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                aria-pressed={category === c}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                  category === c
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Results count */}
      <p className="mb-6 mt-5 text-sm text-muted-foreground">
        {t("resultsCount", { count: isError ? 0 : totalCount })}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl bg-muted/50"
            />
          ))}
        </div>
      ) : isError ? (
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
      ) : pageActivities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-6">
            {pageActivities.map((activity, index) => (
              <RevealItem
                key={activity.id}
                direction="up"
                delay={(index % 4) * 0.05}
                className="h-full"
              >
                <ActivityTicketCard activity={activity} index={index} />
              </RevealItem>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4 ltr:rotate-180" />
              </button>
              <span className="px-2 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
              </button>
            </div>
          ) : null}
        </>
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
