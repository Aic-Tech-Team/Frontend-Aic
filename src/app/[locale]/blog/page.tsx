import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { fetchBlogPosts, mapApiBlogPost } from "@/services/api/blogs";
import { pageRows } from "@/services/api/types";
import { pageHref, pageNumber, param, searchQuery } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 6;
const DISCOVERY_SIZE = 20;

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
  const page = pageNumber(sp);
  const category = param(sp, "category") || "all";
  const search = searchQuery(sp);

  const t = await getTranslations("BlogPage");

  const [pageRes, discoveryFetched] = await Promise.all([
    fetchBlogPosts({
      category: category === "all" ? undefined : category,
      search: search || undefined,
      page,
      page_size: PAGE_SIZE,
    }),
    fetchBlogPosts({ page_size: DISCOVERY_SIZE }),
  ]);

  if (!pageRes) {
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

  const discoveryRes = discoveryFetched ?? pageRes;

  const discoveryPosts = pageRows(discoveryRes).map((r) =>
    mapApiBlogPost(r, locale),
  );
  const categories = Array.from(
    new Set(
      pageRows(discoveryRes)
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c)),
    ),
  ).sort();

  const totalCount = pageRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const posts = pageRows(pageRes).map((r) => mapApiBlogPost(r, locale));

  function buildPageHref(nextPage: number): string {
    return pageHref(
      {
        q: search || undefined,
        category: category === "all" ? undefined : category,
      },
      nextPage,
    );
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
          search={search}
          selectedCategory={category}
        >
          <BlogGrid
            posts={posts}
            totalCount={totalCount}
            currentPage={Math.min(page, totalPages)}
            pageSize={PAGE_SIZE}
            buildPageHref={buildPageHref}
          />
        </BlogExplorer>
      </div>
    </div>
  );
}
