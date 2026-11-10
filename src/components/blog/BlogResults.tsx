import { getLocale } from "next-intl/server";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { EventsLoadError } from "@/components/events/EventsLoadError";
import { fetchBlogPosts, mapApiBlogPost } from "@/services/api/blogs";
import { pageRows } from "@/services/api/types";
import { pageHref } from "@/lib/search-params";

export const BLOG_PAGE_SIZE = 9;

/**
 * The list itself, fetched on its own so the header and the filters render at once and this part
 * streams in (the page keys a Suspense on category, search and page). A failure is shown here,
 * in place.
 */
export async function BlogResults({
  category,
  search,
  page,
  skipId,
}: {
  category: string;
  search: string;
  page: number;
  /** The article shown as the highlight above the list: left out here. */
  skipId?: string;
}) {
  const locale = await getLocale();
  const filtered = category !== "all" || Boolean(search);

  const res = await fetchBlogPosts({
    category: category === "all" ? undefined : category,
    search: search || undefined,
    page,
    page_size: BLOG_PAGE_SIZE,
  });

  if (!res) return <EventsLoadError clearHref={filtered ? "/blog" : undefined} />;

  const totalCount = res.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / BLOG_PAGE_SIZE));
  const query = {
    q: search || undefined,
    category: category === "all" ? undefined : category,
  };

  return (
    <BlogGrid
      posts={pageRows(res)
        .filter((r) => String(r.id) !== skipId)
        .map((r) => mapApiBlogPost(r, locale))}
      totalCount={totalCount}
      currentPage={Math.min(page, totalPages)}
      pageSize={BLOG_PAGE_SIZE}
      buildPageHref={(p) => pageHref(query, p)}
    />
  );
}
