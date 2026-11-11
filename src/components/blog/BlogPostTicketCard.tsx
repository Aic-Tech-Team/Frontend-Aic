"use client";

import { useTranslations } from "next-intl";
import { BlogCard } from "@/components/cards/BlogCard";
import { readMinutes } from "@/lib/read-time";
import type { BlogPostItem } from "@/types/blog";

/** Blog card for the blog list: the shared magazine card with its page's labels. */
export function BlogPostTicketCard({
  post,
}: {
  post: BlogPostItem;
  /** Kept for the grid's call sites. */
  index?: number;
}) {
  const t = useTranslations("BlogPage");
  const tDetail = useTranslations("BlogDetailPage");
  return (
    <BlogCard
      post={post}
      ctaLabel={t("readMore")}
      readTimeLabel={tDetail("readTime", { minutes: readMinutes(post.content || post.summary) })}
    />
  );
}
