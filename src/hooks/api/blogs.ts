import { api } from "@/services/api/client";
import { apiEndpoints, getApiConfig } from "@/services/api/config";
import type { BlogPostItem } from "@/types/blog";

export interface PaginatedBlogsResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ListBlogsParams = {
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export interface ApiBlogPost {
  id: number | string;
  title: string;
  category?: string;
  author?: string | null;
  image?: string | null;
  summary?: string | null;
  short_description?: string | null;
  content?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function fetchBlogPosts(
  params: ListBlogsParams = {},
): Promise<PaginatedBlogsResponse<ApiBlogPost>> {
  return api<PaginatedBlogsResponse<ApiBlogPost>>(apiEndpoints.blogs.list(), {
    params,
    revalidate: 300,
  });
}

export async function fetchBlogPost(id: string | number): Promise<ApiBlogPost> {
  return api<ApiBlogPost>(apiEndpoints.blogs.detail(id), {
    revalidate: 300,
  });
}

export function mapApiBlogPost(post: ApiBlogPost): BlogPostItem {
  const publishedAt = post.published_at ?? post.created_at ?? "";

  return {
    id: String(post.id),
    category: post.category ?? "",
    title: post.title,
    author: post.author ?? undefined,
    image: resolveBlogImage(post.image),
    summary: post.summary ?? post.short_description ?? "",
    content: post.content ?? undefined,
    publishedLabel: formatPublishedDate(publishedAt),
    publishedAt,
  };
}

function resolveBlogImage(image: string | null | undefined): string {
  if (!image) return "/images/qq.jpg";
  if (/^https?:\/\//i.test(image)) return image;

  const { apiBaseUrl } = getApiConfig();
  return apiBaseUrl ? new URL(image, `${apiBaseUrl}/`).toString() : image;
}

function formatPublishedDate(value: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}
