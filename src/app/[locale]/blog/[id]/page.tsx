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
import { Reveal } from "@/components/animations/Reveal";
import { markdownHeadings } from "@/lib/markdown-headings";

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

  const [result, list] = await Promise.all([
    fetchBlogPost(id),
    fetchBlogPosts({ page_size: 8 }),
  ]);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const post = mapApiBlogPost(result.data, locale);
  const readTime = (content: string | undefined) =>
    t("readTime", { minutes: estimateReadMinutes(content) });
  const sidebar = toSidebar(list?.results ?? [], id, locale, readTime);

  return (
    <Reveal direction="up" duration={1.1}>
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
          // shown only when the article was edited on another day than it came out
          updatedAt:
            post.updatedLabel && post.updatedLabel !== post.publishedLabel
              ? post.updatedLabel
              : "",
          readTime: readTime(post.content ?? post.summary),
        }}
        heroImage={post.image}
        heroAlt={post.title}
        content={post.content ?? post.summary}
        headings={markdownHeadings(post.content ?? "")}
        latestPosts={sidebar.slice(0, 4)}
        labels={{
          breadcrumbLabel: t("breadcrumbLabel"),
          latestPostsTitle: t("latestPostsTitle"),
          viewAll: t("viewAll"),
          authorLabel: t("authorLabel"),
          publishedLabel: t("publishedLabel"),
          updatedLabel: t("updatedLabel"),
          readTimeLabel: t("readTimeLabel"),
          infoTitle: t("infoTitle"),
          categoryLabel: t("categoryLabel"),
          share: t("share"),
          linkCopied: t("linkCopied"),
          tocTitle: t("tocTitle"),
        }}
      />
    </Reveal>
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
