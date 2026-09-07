import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { BlogPostItem } from "@/types/blog";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { BlogGrid } from "@/components/blog/BlogGrid";

export const revalidate = 300;

const PAGE_SIZE = 6;

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

  const rawQuery =
    (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const query = rawQuery.trim().slice(0, 100);
  const currentPage = Math.max(1, isNaN(rawPage) ? 1 : rawPage);

  const t = await getTranslations("BlogPage");

  // TODO: API data will be added here

  const discoveryPosts: BlogPostItem[] = [];
  const categories: string[] = [];
  const totalCount = 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagePosts: BlogPostItem[] = [];

  // Builds a URL for a given page, preserving the current category and query.
  function buildPageHref(page: number): string {
    const params = new URLSearchParams();

    if (query) params.set("q", rawQuery.trim());

    if (rawCategory !== "all") {
      params.set("category", rawCategory);
    }

    if (page !== 1) {
      params.set("page", String(page));
    }

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
          totalCount={totalCount}
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