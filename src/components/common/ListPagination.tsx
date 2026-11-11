import { getLocale, getTranslations } from "next-intl/server";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNavLink,
  PaginationNavNext,
  PaginationNavPrevious,
} from "@/components/ui/pagination";

/** The page numbers to show: the first, the last, the current one and its neighbours, gaps as null. */
function pageRange(current: number, total: number): (number | null)[] {
  const range: (number | null)[] = [];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  range.push(1);
  if (start > 2) range.push(null);
  for (let p = start; p <= end; p += 1) range.push(p);
  if (end < total - 1) range.push(null);
  if (total > 1) range.push(total);
  return range;
}

/**
 * The one pagination of the site, for every list (events, activities, blog): previous and next as
 * labelled buttons, the numbers between them on wide screens, and "page 3 of 8" in their place on
 * phones. It renders nothing for a single page, and previous / next that cannot be followed stay in
 * place, dimmed, so the row does not move from page to page.
 */
export async function ListPagination({
  currentPage,
  totalCount,
  pageSize,
  buildPageHref,
  className,
}: {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  buildPageHref: (page: number) => string;
  className?: string;
}) {
  const t = await getTranslations("Pagination");
  const locale = await getLocale();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const num = (n: number) => n.toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <Pagination aria-label={t("label")} className={className ?? "mt-10"}>
      <PaginationContent>
        <PaginationItem>
          <PaginationNavPrevious
            href={hasPrev ? buildPageHref(currentPage - 1) : undefined}
            label={t("previous")}
            aria-disabled={!hasPrev}
          >
            {t("previous")}
          </PaginationNavPrevious>
        </PaginationItem>

        {/* phones: where you are, in one cell */}
        <PaginationItem className="sm:hidden">
          <span
            aria-current="page"
            className="inline-flex h-10 items-center rounded-xl border border-primary/40 bg-primary/10 px-4 text-sm font-bold tabular-nums text-foreground"
          >
            {t("pageOf", { current: num(currentPage), total: num(totalPages) })}
          </span>
        </PaginationItem>

        {pageRange(currentPage, totalPages).map((p, i) =>
          p === null ? (
            <PaginationItem key={`gap-${i}`} className="max-sm:hidden">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p} className="max-sm:hidden">
              <PaginationNavLink
                href={buildPageHref(p)}
                isActive={p === currentPage}
                aria-label={t("goTo", { page: num(p) })}
              >
                {num(p)}
              </PaginationNavLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNavNext
            href={hasNext ? buildPageHref(currentPage + 1) : undefined}
            label={t("next")}
            aria-disabled={!hasNext}
          >
            {t("next")}
          </PaginationNavNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
