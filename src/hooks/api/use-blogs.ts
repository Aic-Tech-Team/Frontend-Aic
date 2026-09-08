"use client";

import { useQuery } from "@tanstack/react-query";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { fetchBlogPost, fetchBlogPosts, ListBlogsParams, mapApiBlogPost } from "./blogs";


export const blogsKeys = {
  all: ["blogs"] as const,
  list: (params: ListBlogsParams) => ["blogs", "list", params] as const,
  detail: (id: string | number) => ["blogs", "detail", id] as const,
};

export function useBlogPostsQuery(
  params: ListBlogsParams = {},
  options: { enabled?: boolean } = {},
) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: blogsKeys.list(params),
    enabled: options.enabled,

    queryFn: async () => {
      try {
        const { count, next, previous, results } = await fetchBlogPosts(params);

        return {
          count,
          next,
          previous,
          posts: results.map(mapApiBlogPost),
        };
      } catch (error) {
        handleError(error, {
          showToast: true,
          logError: true,
        });

        throw error;
      }
    },
  });

  return {
    posts: query.data?.posts ?? [],
    count: query.data?.count ?? 0,
    hasNextPage: Boolean(query.data?.next),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useBlogPostQuery(id: string | number) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: blogsKeys.detail(id),

    queryFn: async () => {
      try {
        const post = await fetchBlogPost(id);

        return mapApiBlogPost(post);
      } catch (error) {
        handleError(error, {
          showToast: true,
          logError: true,
          notFoundAction: "silent",
        });

        throw error;
      }
    },
  });

  return {
    post: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
