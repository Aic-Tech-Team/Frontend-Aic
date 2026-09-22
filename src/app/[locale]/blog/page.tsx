import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { ApiError } from "@/services/api/client";
import {
  fetchBlogPosts,
  mapApiBlogPost,
  type ApiBlogPost,
  type PaginatedBlogsResponse,
} from "@/hooks/api/blogs";

export const revalidate = 300;

const PAGE_SIZE = 6;
const CATEGORY_DISCOVERY_SIZE = 100;

const EMPTY_PAGE: PaginatedBlogsResponse<ApiBlogPost> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

/** Guards against a non-paginated or malformed payload reaching `.map`. */
function resultsOf(
  res: PaginatedBlogsResponse<ApiBlogPost>,
): ApiBlogPost[] {
  return Array.isArray(res?.results) ? res.results : [];
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;

  const rawPage = Number(
    Array.isArray(sp.page) ? sp.page[0] : (sp.page ?? "1"),
  );
  const rawCategory =
    (Array.isArray(sp.category) ? sp.category[0] : sp.category) ?? "all";
  const rawQuery = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const query = rawQuery.trim().slice(0, 100);
  const currentPage = Math.max(1, isNaN(rawPage) ? 1 : rawPage);

  const t = await getTranslations("BlogPage");

  // A hand-crafted ?category=xxx that the API doesn't know returns 400, and a
  // ?page= past the last page returns 404 ("Invalid page"). Neither should take
  // the route down — fall back to unfiltered / empty instead of crashing (500).
  async function fetchPageRes() {
    try {
      return await fetchBlogPosts({
        category: rawCategory === "all" ? undefined : rawCategory,
        search: query || undefined,
        page: currentPage,
        page_size: PAGE_SIZE,
      });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;

      if (error.status === 404) return EMPTY_PAGE;

      if (error.status === 400 && rawCategory !== "all") {
        try {
          return await fetchBlogPosts({
            search: query || undefined,
            page: currentPage,
            page_size: PAGE_SIZE,
          });
        } catch (retryError) {
          if (retryError instanceof ApiError && retryError.status === 404) {
            return EMPTY_PAGE;
          }
          throw retryError;
        }
      }

      throw error;
    }
  }

  let discoveryRes: PaginatedBlogsResponse<ApiBlogPost>;
  let pageRes: PaginatedBlogsResponse<ApiBlogPost>;

  try {
    [discoveryRes, pageRes] = await Promise.all([
      // Doubles as the spotlight source and the category-discovery source.
      fetchBlogPosts({ page_size: CATEGORY_DISCOVERY_SIZE }),
      fetchPageRes(),
    ]);
  } catch (error) {
    // Upstream unreachable or erroring — render the page shell with a fallback
    // rather than letting the throw become an opaque production 500.
    console.error("[blog] failed to load posts:", error);
    return (
      <div className="py-10 sm:py-16">
        <div className="container">
          <SectionHeading
            badge={t("badge")}
            icon={Newspaper}
            title={t("title")}
            description={t("description")}
            align="center"
          />
          <ContentUnavailable className="mt-8" />
        </div>
      </div>
    );
  }

  const discoveryPosts = resultsOf(discoveryRes).map(mapApiBlogPost);
  const categories = Array.from(
    new Set(
      resultsOf(discoveryRes)
        .map((p) => p.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort();

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagePosts = resultsOf(pageRes).map(mapApiBlogPost);

  function buildPageHref(page: number): string {
    const params = new URLSearchParams();
    if (query) params.set("q", rawQuery.trim());
    if (rawCategory !== "all") params.set("category", rawCategory);
    if (page !== 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Newspaper}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <BlogExplorer
          spotlightPosts={discoveryPosts}
          categories={categories}
          search={query}
          selectedCategory={rawCategory}
        >
          <BlogGrid
            posts={pagePosts}
            totalCount={totalCount}
            currentPage={Math.min(currentPage, totalPages)}
            pageSize={PAGE_SIZE}
            locale={locale}
            buildPageHref={buildPageHref}
          />
        </BlogExplorer>
      </div>
    </div>
  );
}
