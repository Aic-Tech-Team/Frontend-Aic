import { StickyColumn } from "@/components/common/StickyColumn";
import { ArticleToc, type TocItem } from "./ArticleToc";
import { BlogContent } from "./BlogContent";
import { BlogHeader } from "./BlogHeader";
import { BlogHero } from "./BlogHero";
import { BlogInfoCard } from "./BlogInfoCard";
import { LatestPosts } from "./SidebarCards";
import type {
  ArticleMetaItem,
  BlogBreadcrumbItem,
  BlogDetailLabels,
  SidebarPost,
} from "@/types/blog";

interface BlogArticlePageProps {
  breadcrumb: BlogBreadcrumbItem[];
  category: string;
  title: string;
  meta: ArticleMetaItem;
  heroImage: string;
  heroAlt: string;
  content: string;
  /** The article's `##` headings; the table of contents shows when there are at least two. */
  headings: TocItem[];
  latestPosts: SidebarPost[];
  labels: BlogDetailLabels;
}

/**
 * An article card in the same rounded `surface` as the sidebar cards, on the site's container so
 * its edges line up with the header. The sidebar stays in view (`StickyColumn`, which also lets
 * you reach a column taller than the screen): the facts and a share button, the table of contents
 * that follows the reader, then the latest articles.
 */
export function BlogArticlePage({
  breadcrumb,
  category,
  title,
  meta,
  heroImage,
  heroAlt,
  content,
  headings,
  latestPosts,
  labels,
}: BlogArticlePageProps) {
  return (
    <div dir="rtl" className="w-full py-6 sm:py-10">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <article className="surface min-w-0 rounded-[18px] p-5 shadow-none sm:p-7 lg:p-9">
            <BlogHeader
              breadcrumb={breadcrumb}
              category={category}
              title={title}
              meta={meta}
              labels={labels}
            />

            <div className="mt-6">
              <BlogHero src={heroImage} alt={heroAlt} />
            </div>

            <div className="mt-7">
              <BlogContent content={content} />
            </div>
          </article>

          <StickyColumn as="aside" className="flex min-w-0 flex-col gap-6">
            <BlogInfoCard meta={meta} category={category} title={title} labels={labels} />
            {headings.length >= 2 ? (
              <section className="surface w-full rounded-[18px] p-5 shadow-none sm:p-6">
                <ArticleToc items={headings} title={labels.tocTitle} />
              </section>
            ) : null}
            {latestPosts.length > 0 ? (
              <LatestPosts posts={latestPosts} labels={labels} />
            ) : null}
          </StickyColumn>
        </div>
      </div>
    </div>
  );
}
