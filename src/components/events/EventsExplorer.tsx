"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Carousel } from "@/components/common/Carousel";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus, EventStatus } from "@/types/events";

const SEARCH_MAX_LENGTH = 100;

type FilterKey = "all" | EventStatus;

const FILTER_KEYS: FilterKey[] = ["all", "ongoing", "upcoming", "past"];

interface EventsExplorerProps {
  spotlightEvents: EventItemWithStatus[];
  search: string;
  selectedFilter: FilterKey;
  children: React.ReactNode;
}

/** Client filters only. List HTML comes from the server as `children`. */
export function EventsExplorer({
  spotlightEvents,
  search,
  selectedFilter,
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
  const lastPushedRef = useRef<string | null>(null);

  function pushFilters(nextSearch: string, nextFilter: FilterKey) {
    const trimmedSearch = nextSearch.trim();
    if (nextFilter === filter && trimmedSearch === search.trim()) return;

    const params = new URLSearchParams();
    if (trimmedSearch) params.set("q", trimmedSearch);
    if (nextFilter !== "all") params.set("filter", nextFilter);
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    if (lastPushedRef.current === href) return;
    lastPushedRef.current = href;
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
      {spotlightEvents.length > 0 ? (
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
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
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
      ) : null}

      <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute inset-s-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
              onClick={() => {
                setSearchInput("");
                pushFilters("", filter);
              }}
              aria-label={t("clearFilters")}
              className="absolute inset-e-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pushFilters(searchInput, key)}
              aria-pressed={filter === key}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                filter === key
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t(`filters.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
