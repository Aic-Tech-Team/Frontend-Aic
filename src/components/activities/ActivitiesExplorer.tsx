"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { sanitizeSearchInput } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

const SEARCH_MAX_LENGTH = 100;
const ALL_CATEGORY = "all";

interface ActivitiesExplorerProps {
  categories: string[];
  search: string;
  selectedCategory: string;
  children: React.ReactNode;
}

/** Client filters only. List HTML comes from the server as `children`. */
export function ActivitiesExplorer({
  categories,
  search,
  selectedCategory,
  children,
}: ActivitiesExplorerProps) {
  const t = useTranslations("ActivitiesPage");
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSearchInput(search);
  }

  const category = selectedCategory || ALL_CATEGORY;
  const lastPushedRef = useRef<string | null>(null);

  function pushFilters(nextSearch: string, nextCategory: string) {
    const trimmedSearch = nextSearch.trim();
    if (nextCategory === category && trimmedSearch === search.trim()) return;

    const params = new URLSearchParams();
    if (trimmedSearch) params.set("q", trimmedSearch);
    if (nextCategory !== ALL_CATEGORY) params.set("category", nextCategory);
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
      category,
    );
  }

  return (
    <div>
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
                pushFilters("", category);
              }}
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
              onClick={() => pushFilters(searchInput, ALL_CATEGORY)}
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
                onClick={() => pushFilters(searchInput, c)}
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

      <div className="mt-8">{children}</div>
    </div>
  );
}
