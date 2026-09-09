import { BlogContent } from "./BlogContent";
import { BlogHeader } from "./BlogHeader";
import { BlogHero } from "./BlogHero";
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
  paragraphs: string[];
  latestPosts: SidebarPost[];
  labels: BlogDetailLabels;
}

export function BlogArticlePage({
  breadcrumb,
  category,
  title,
  meta,
  heroImage,
  heroAlt,
  paragraphs,
  latestPosts,
  labels,
}: BlogArticlePageProps) {
  return (
    <div dir="rtl" className="w-full py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <article className="surface real-ticket-mask real-ticket-mask--vertical min-w-0 border-0 p-5 sm:p-7 lg:p-9">
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
              <BlogContent paragraphs={paragraphs} />
            </div>
          </article>

          <aside className="flex min-w-0 flex-col gap-6">
            <LatestPosts posts={latestPosts} labels={labels} />
          </aside>
        </div>
      </div>
    </div>
  );
}
