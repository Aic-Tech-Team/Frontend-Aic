import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { fetchBlogPosts, mapApiBlogPost } from "@/hooks/api/blogs";

export const revalidate = 300;

const PAGE_SIZE = 6;
const CATEGORY_DISCOVERY_SIZE = 100;

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

  const [discoveryRes, pageRes] = await Promise.all([
    // Doubles as the spotlight source and the category-discovery source.
    fetchBlogPosts({ page_size: CATEGORY_DISCOVERY_SIZE }),
    fetchBlogPosts({
      category: rawCategory === "all" ? undefined : rawCategory,
      search: query || undefined,
      page: currentPage,
      page_size: PAGE_SIZE,
    }),
  ]);

  const discoveryPosts = discoveryRes.results.map(mapApiBlogPost);
  const categories = Array.from(
    new Set(
      discoveryRes.results
        .map((p) => p.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort();

  const totalCount = pageRes.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagePosts = pageRes.results.map(mapApiBlogPost);

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
