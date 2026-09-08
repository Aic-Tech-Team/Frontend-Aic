"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/common/Carousel";
import { RevealItem } from "@/components/animations/Reveal";
import { BlogPostTicketCard } from "@/components/blog/BlogPostTicketCard";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { BlogPostItem } from "@/types/blog";

const SEARCH_MAX_LENGTH = 100;
const PAGE_SIZE = 6;
const ALL_CATEGORY = "all";

export function BlogExplorer({ posts }: { posts: BlogPostItem[] }) {
  const t = useTranslations("BlogPage");

  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () =>
      Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort(),
    [posts],
  );

  const query = sanitizeSearchInput(searchInput, SEARCH_MAX_LENGTH)
    .trim()
    .toLowerCase();

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        category === ALL_CATEGORY || post.category === category;
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.summary.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [posts, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagePosts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasSearchOrFilter = query.length > 0 || category !== ALL_CATEGORY;

  function handleClearAll() {
    setSearchInput("");
    setCategory(ALL_CATEGORY);
    setPage(1);
  }

  return (
    <div>
      {/* Spotlight carousel — recent posts, regardless of filter */}
      {posts.length > 0 ? (
        <div className="mb-6">
          <Carousel
            ariaLabel={t("title")}
            slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
            options={{ loop: false, slidesToScroll: 1 }}
          >
            {posts.slice(0, 5).map((post) => (
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
                  "rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors sm:text-sm",
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
        {t("resultsCount", { count: filtered.length })}
      </p>

      {pagePosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-6">
            {pagePosts.map((post, index) => (
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
