import { apiResult, ApiError } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { resolveMediaUrl } from "@/services/api/media";
import type { PaginatedResponse } from "@/services/api/types";
import type { BlogPostItem } from "@/types/blog";

export type ListBlogsParams = {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export interface ApiBlogPost {
  id: number | string;
  title: string;
  category?: string;
  author?: string | null;
  cover_image?: string | null;
  summary?: string | null;
  content?: string | null;
  status?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const EMPTY: PaginatedResponse<ApiBlogPost> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export async function fetchBlogPosts(
  params: ListBlogsParams = {},
  opts: { revalidate?: number } = { revalidate: 300 },
): Promise<PaginatedResponse<ApiBlogPost> | null> {
  const result = await apiResult<PaginatedResponse<ApiBlogPost>>(
    apiEndpoints.blogs.list(),
    { params, revalidate: opts.revalidate },
  );
  if (result.ok) return result.data;
  if (result.notFound) return EMPTY;
  if (
    result.error instanceof ApiError &&
    result.error.status === 400 &&
    params.category
  ) {
    const { category: _category, ...rest } = params;
    return fetchBlogPosts(rest, opts);
  }
  return null;
}

export async function fetchBlogPost(
  id: string | number,
  opts: { revalidate?: number } = { revalidate: 300 },
) {
  return apiResult<ApiBlogPost>(apiEndpoints.blogs.detail(id), {
    revalidate: opts.revalidate,
  });
}

export function mapApiBlogPost(post: ApiBlogPost): BlogPostItem {
  const publishedAt = post.published_at ?? post.created_at ?? "";

  return {
    id: String(post.id),
    category: post.category ?? "",
    title: post.title,
    author: post.author ?? undefined,
    image: resolveMediaUrl(post.cover_image),
    summary: post.summary ?? post.content?.slice(0, 160) ?? "",
    content: post.content ?? undefined,
    publishedLabel: formatPublishedDate(publishedAt),
    publishedAt,
  };
}

function formatPublishedDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
