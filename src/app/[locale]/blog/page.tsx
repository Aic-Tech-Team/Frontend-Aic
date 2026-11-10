import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogFeatured } from "@/components/blog/BlogFeatured";
import { BlogResults } from "@/components/blog/BlogResults";
import { BlogResultsSkeleton } from "@/components/blog/BlogSkeletons";
import { PageHero } from "@/components/common/PageHero";
import { fetchBlogPosts, mapApiBlogPost, type ApiBlogPost } from "@/services/api/blogs";
import { pageRows } from "@/services/api/types";
import { pageNumber, param, searchQuery } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const DISCOVERY_SIZE = 20;

/** The rows that feed the filter bar and the highlight: one cached fetch. */
async function discovery() {
  return pageRows(await fetchBlogPosts({ page_size: DISCOVERY_SIZE }));
}

/** The newest article that has a cover. */
function newestOf(rows: ApiBlogPost[]) {
  return [...rows]
    .filter((r) => r.cover_image)
    .sort(
      (a, b) =>
        Date.parse(b.published_at ?? b.created_at ?? "") -
        Date.parse(a.published_at ?? a.created_at ?? ""),
    )[0];
}

/**
 * The shell (header, highlight, filters) renders from the one cached discovery fetch; the list
 * streams in inside its own Suspense, keyed on category, search and page so changing any of them
 * shows a skeleton at once instead of freezing the old list.
 */
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
  const rows = await discovery();
  const categories = Array.from(
    new Set(rows.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ).sort();

  // the highlight belongs to the unfiltered first view only, and the list leaves it out there so
  // the newest article is not shown twice
  const showFeatured = category === "all" && !search && page === 1;
  const newest = showFeatured ? newestOf(rows) : undefined;

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <PageHero badge={t("badge")} title={t("title")} description={t("description")} />
        <BlogExplorer
          categories={categories}
          search={search}
          selectedCategory={category}
          featured={
            newest ? <BlogFeatured post={mapApiBlogPost(newest, locale)} /> : null
          }
        >
          <Suspense key={`${category}|${search}|${page}`} fallback={<BlogResultsSkeleton />}>
            <BlogResults category={category} search={search} page={page} skipId={newest ? String(newest.id) : undefined} />
          </Suspense>
        </BlogExplorer>
      </div>
    </div>
  );
}
