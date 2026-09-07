"use client";

import { useCallback, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/common/Carousel";
import { RevealItem } from "@/components/animations/Reveal";
import { BlogPostTicketCard } from "@/components/blog/BlogPostTicketCard";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import { BlogPostItem } from "@/types/blog";

const SEARCH_MAX_LENGTH = 100;
const SEARCH_DEBOUNCE_MS = 300;
const ALL_CATEGORY = "all";

interface BlogExplorerProps {
  spotlightPosts: BlogPostItem[];
  categories: string[];
  totalCount: number;
  children: React.ReactNode;
}

export function BlogExplorer({
  spotlightPosts,
  categories,
  totalCount,
  children,
}: BlogExplorerProps) {
  const t = useTranslations("BlogPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? ALL_CATEGORY;

  const [searchInput, setSearchInput] = useState(currentQuery);

  const debouncedSearch = useDebounce(
    sanitizeSearchInput(searchInput, SEARCH_MAX_LENGTH),
    SEARCH_DEBOUNCE_MS,
  );

  const isLiveSearchActive = debouncedSearch.trim().length > 0;

  // API Call removed
  const livePosts: BlogPostItem[] = [];
  const liveCount = 0;
  const isLiveSearchLoading = false;

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

      params.delete("page");

      const qs = params.toString();

      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      startTransition(() => {
        router.push(
          buildHref({
            category: category === ALL_CATEGORY ? null : category,
          }),
          { scroll: false },
        );
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
    searchInput.trim().length > 0 || currentCategory !== ALL_CATEGORY;

  const resultsCount = isLiveSearchActive ? liveCount : totalCount;

  return (
    <div>
      {/* Spotlight carousel — recent posts, regardless of filter */}
      {spotlightPosts.length > 0 ? (
        <div className="mb-6">
          <Carousel
            ariaLabel={t("title")}
            slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
            options={{ loop: false, slidesToScroll: 1 }}
          >
            {spotlightPosts.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="group relative h-52 overflow-hidden rounded-3xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(10,10,20,0.18), rgba(10,10,20,0.75)), url(${post.image})`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="relative flex h-full flex-col justify-end p-4 text-white sm:p-5">
                  <span className="mb-2 w-fit rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    {post.category}
                  </span>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg">
                    {post.title}
                  </h3>

                  <p className="mt-1 text-xs text-white/70 sm:text-sm">
                    {post.publishedLabel}
                  </p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      ) : null}

      {/* Search + category filter bar */}
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

        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(ALL_CATEGORY)}
              aria-pressed={currentCategory === ALL_CATEGORY}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm",
                currentCategory === ALL_CATEGORY
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t("filters.all")}
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                aria-pressed={currentCategory === category}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors sm:text-sm",
                  currentCategory === category
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Results count */}
      <p className="mb-6 mt-5 text-sm text-muted-foreground">
        {t("resultsCount", { count: resultsCount })}
      </p>

      {isLiveSearchActive ? (
        isLiveSearchLoading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-3xl bg-muted/50"
              />
            ))}
          </div>
        ) : livePosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-x-8">
            {livePosts.map((post, index) => (
              <RevealItem
                key={post.id}
                direction="up"
                delay={(index % 4) * 0.05}
                className="h-full"
              >
                <BlogPostTicketCard post={post} index={index} />
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
