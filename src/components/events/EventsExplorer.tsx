"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { withQuery } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { beginNavigation } from "@/lib/begin-navigation";
import type { EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

interface EventsExplorerProps {
  search: string;
  selectedFilter: FilterKey;
  /** The highlighted event, streamed in by the server. */
  featured?: React.ReactNode;
  children: React.ReactNode;
}

/** Client filters only. List HTML comes from the server as `children`. */
export function EventsExplorer({
  search,
  selectedFilter,
  featured,
  children,
}: EventsExplorerProps) {
  const t = useTranslations("EventsPage");
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchInput(search);
  }

  const filter = selectedFilter || "all";


  function pushFilters(nextSearch: string, nextFilter: FilterKey) {
    const trimmedSearch = nextSearch.trim();
    if (nextFilter === filter && trimmedSearch === search.trim()) return;

    const href = withQuery(pathname, {
      q: trimmedSearch || undefined,
      filter: nextFilter !== "all" ? nextFilter : undefined,
    });
    beginNavigation();
    router.push(href);
  }

  function handleSearch(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    pushFilters(
      sanitizeSearchInput(searchInput, SEARCH_MAX_LENGTH).trim(),
      filter,
    );
  }

  return (
    <div>
      {featured}

      <div className="mb-8 flex flex-col gap-3 border-b border-border/50 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div
          role="group"
          aria-label={t("title")}
          className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] sm:gap-8"
        >
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pushFilters(searchInput, key)}
              aria-pressed={filter === key}
              className={cn(
                "group relative flex min-w-11 shrink-0 items-center justify-center gap-2 px-1 pb-3.5 pt-2 text-sm font-bold transition-colors duration-300 sm:text-base",
                filter === key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "ongoing" ? (
                <span className="size-2 shrink-0 animate-pulse-glow rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
              ) : null}
              {t(`filters.${key}`)}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-center rounded-full bg-primary shadow-[0_0_14px_2px_color-mix(in_srgb,var(--primary)_60%,transparent)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  filter === key
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-40",
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 pb-3 sm:pb-2.5">
          <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:w-72 sm:flex-none lg:w-96">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="h-10 rounded-xl border-border/50 bg-transparent ps-9 pe-8 text-sm"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  pushFilters("", filter);
                }}
                aria-label={t("clearFilters")}
                className="absolute inset-e-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </form>
          <p
            id="events-count"
            className="shrink-0 whitespace-nowrap text-xs text-muted-foreground sm:text-sm"
          />
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
