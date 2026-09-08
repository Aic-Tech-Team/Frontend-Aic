import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ApiError } from "@/services/api/client";
import {
  fetchBlogPost,
  fetchBlogPosts,
  mapApiBlogPost,
} from "@/hooks/api/blogs";
import { BlogArticlePage } from "@/components/blog/detail/BlogArticlePage";
import type { SidebarPost } from "@/types/blog";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  try {
    const apiPost = await fetchBlogPost(id);
    return {
      title: apiPost.title,
      description: apiPost.summary ?? apiPost.content?.slice(0, 160),
    };
  } catch {
    return {};
  }
}

function splitParagraphs(
  content: string | undefined,
  summary: string,
): string[] {
  const raw = (content ?? summary ?? "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 0) return parts;
  // Single block: chunk into ~2 paragraphs for readability
  if (raw.length > 400) {
    const mid = Math.floor(raw.length / 2);
    const splitAt =
      raw.indexOf("。", mid) + 1 || raw.indexOf(".", mid) + 1 || mid;
    return [raw.slice(0, splitAt).trim(), raw.slice(splitAt).trim()].filter(
      Boolean,
    );
  }
  return [raw];
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

  let apiPost: Awaited<ReturnType<typeof fetchBlogPost>>;
  try {
    apiPost = await fetchBlogPost(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const post = mapApiBlogPost(apiPost);
  const readTime = (content: string | undefined) =>
    t("readTime", { minutes: estimateReadMinutes(content) });

  let sidebar: SidebarPost[] = [];
  try {
    const list = await fetchBlogPosts({
      page_size: 8,
    });
    sidebar = list.results
      .filter((p) => String(p.id) !== String(id))
      .slice(0, 7)
      .map((p) => {
        const mapped = mapApiBlogPost(p);
        return {
          id: mapped.id,
          title: mapped.title,
          image: mapped.image,
          date: mapped.publishedLabel,
          readTime: readTime(mapped.content ?? mapped.summary),
          source: mapped.author || mapped.category || "",
        } satisfies SidebarPost;
      });
  } catch {
    sidebar = [];
  }

  const latestPosts = sidebar.slice(0, 4);

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
      paragraphs={splitParagraphs(post.content, post.summary)}
      latestPosts={latestPosts}
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