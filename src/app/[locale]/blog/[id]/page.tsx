import { stripMarkdown } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ContentUnavailablePage } from "@/components/common/ContentUnavailable";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  fetchBlogPost,
  fetchBlogPosts,
  mapApiBlogPost,
  type ApiBlogPost,
} from "@/services/api/blogs";
import { BlogArticlePage } from "@/components/blog/detail/BlogArticlePage";
import type { SidebarPost } from "@/types/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const result = await fetchBlogPost(id);
  if (!result.ok) return {};
  return {
    title: result.data.title,
    description:
      result.data.summary ??
      stripMarkdown(result.data.content ?? "").slice(0, 160),
  };
}

function estimateReadMinutes(content: string | undefined): number {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) || 5;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("BlogDetailPage");

  const result = await fetchBlogPost(id);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const post = mapApiBlogPost(result.data, locale);
  const readTime = (content: string | undefined) =>
    t("readTime", { minutes: estimateReadMinutes(content) });

  const list = await fetchBlogPosts({ page_size: 8 });
  const sidebar = toSidebar(list?.results ?? [], id, locale, readTime);

  return (
    <BlogArticlePage
      breadcrumb={[
        { label: t("breadcrumbHome"), href: "/" },
        { label: t("breadcrumbBlog"), href: "/blog" },
        { label: post.title },
      ]}
      category={post.category}
      title={post.title}
      meta={{
        author: post.author ?? "",
        publishedAt: post.publishedLabel,
        updatedAt: post.publishedLabel,
        readTime: readTime(post.content ?? post.summary),
      }}
      heroImage={post.image}
      heroAlt={post.title}
      content={post.content ?? post.summary}
      latestPosts={sidebar.slice(0, 4)}
      labels={{
        breadcrumbLabel: t("breadcrumbLabel"),
        latestPostsTitle: t("latestPostsTitle"),
        viewAll: t("viewAll"),
        authorLabel: t("authorLabel"),
        publishedLabel: t("publishedLabel"),
        updatedLabel: t("updatedLabel"),
        readTimeLabel: t("readTimeLabel"),
      }}
    />
  );
}

function toSidebar(
  rows: ApiBlogPost[],
  excludeId: string,
  locale: string,
  readTime: (content: string | undefined) => string,
): SidebarPost[] {
  return rows
    .filter((p) => String(p.id) !== String(excludeId))
    .slice(0, 7)
    .map((p) => {
      const mapped = mapApiBlogPost(p, locale);
      return {
        id: mapped.id,
        title: mapped.title,
        image: mapped.image,
        date: mapped.publishedLabel,
        readTime: readTime(mapped.content ?? mapped.summary),
        source: mapped.author || mapped.category || "",
      } satisfies SidebarPost;
    });
}
