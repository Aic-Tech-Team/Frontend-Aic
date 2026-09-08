import { getTranslations } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { RevealItem } from "@/components/animations/Reveal";
import { BlogPostTicketCard } from "@/components/blog/BlogPostTicketCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNavLink,
  PaginationNavNext,
  PaginationNavPrevious,
} from "@/components/ui/pagination";
import { BlogPostItem } from "@/types/blog";

function getPaginationRange(current: number, total: number): (number | null)[] {
  const siblings = 1;
  const range: (number | null)[] = [];

  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);

  range.push(1);
  if (start > 2) range.push(null);
  for (let p = start; p <= end; p += 1) range.push(p);
  if (end < total - 1) range.push(null);
  if (total > 1) range.push(total);

  return range;
}

interface BlogGridProps {
  posts: BlogPostItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  locale: string;
  /** Callback that returns the href for a given page number. */
  buildPageHref: (page: number) => string;
}

export async function BlogGrid({
  posts,
  totalCount,
  currentPage,
  pageSize,
  locale,
  buildPageHref,
}: BlogGridProps) {
  const t = await getTranslations("BlogPage");
  const isFa = locale === "fa";

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginationRange = getPaginationRange(currentPage, totalPages);

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-x-6">
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

      {totalPages > 1 ? (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationNavPrevious
                href={
                  currentPage > 1 ? buildPageHref(currentPage - 1) : undefined
                }
                label={isFa ? "صفحه قبلی" : "Previous page"}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {paginationRange.map((pageNumber, index) =>
              pageNumber === null ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationNavLink
                    href={buildPageHref(pageNumber)}
                    isActive={pageNumber === currentPage}
                    aria-label={
                      isFa
                        ? `رفتن به صفحه ${pageNumber}`
                        : `Go to page ${pageNumber}`
                    }
                  >
                    {pageNumber.toLocaleString(isFa ? "fa-IR" : "en-US")}
                  </PaginationNavLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNavNext
                href={
                  currentPage < totalPages
                    ? buildPageHref(currentPage + 1)
                    : undefined
                }
                label={isFa ? "صفحه بعدی" : "Next page"}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </>
  );
}
