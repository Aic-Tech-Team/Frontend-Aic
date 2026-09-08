"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Carousel } from "@/components/common/Carousel";
import { cn } from "@/lib/utils";
import type { BlogPostItem } from "@/types/blog";

const SEARCH_MAX_LENGTH = 100;
const ALL_CATEGORY = "all";

interface BlogExplorerProps {
  spotlightPosts: BlogPostItem[];
  categories: string[];
  search: string;
  selectedCategory: string;
  children: React.ReactNode;
}

export function BlogExplorer({
  spotlightPosts,
  categories,
  search,
  selectedCategory,
  children,
}: BlogExplorerProps) {
  const t = useTranslations("BlogPage");
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(search);
  const category = selectedCategory || ALL_CATEGORY;

  function updateFilters(nextSearch: string, nextCategory: string) {
    const params = new URLSearchParams();
    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    if (nextCategory !== ALL_CATEGORY) params.set("category", nextCategory);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters(searchInput.slice(0, SEARCH_MAX_LENGTH), category);
  }

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
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
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
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute inset-s-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
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
              className="absolute inset-e-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </form>

        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                updateFilters(searchInput, ALL_CATEGORY);
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
                  updateFilters(searchInput, c);
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
      {children}
    </div>
  );
}
