import { getTranslations } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { RevealItem } from "@/components/animations/Reveal";
import { BlogPostTicketCard } from "@/components/blog/BlogPostTicketCard";
import { ListPagination } from "@/components/common/ListPagination";
import { ResultsCountSlot } from "@/components/common/ResultsCountSlot";
import type { BlogPostItem } from "@/types/blog";

interface BlogGridProps {
  posts: BlogPostItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  buildPageHref: (page: number) => string;
}

/** Server Component — titles land in the HTML for crawlers / View Source. */
export async function BlogGrid({
  posts,
  totalCount,
  currentPage,
  pageSize,
  buildPageHref,
}: BlogGridProps) {
  const t = await getTranslations("BlogPage");

  if (posts.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
        <Newspaper className="h-10 w-10 text-primary-300" />
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {t("noResultsTitle")}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("noResultsDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ResultsCountSlot slotId="blog-count" text={t("resultsCount", { count: totalCount })} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
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
      <ListPagination
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        buildPageHref={buildPageHref}
      />
    </>
  );
}
