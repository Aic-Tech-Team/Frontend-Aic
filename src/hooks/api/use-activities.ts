"use client";

import { useQuery } from "@tanstack/react-query";

import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  fetchActivities,
  fetchActivity,
  ListActivitiesParams,
  mapApiActivity,
} from "./activities";

export const activitiesKeys = {
  all: ["activities"] as const,
  list: (params: ListActivitiesParams) =>
    ["activities", "list", params] as const,
  detail: (id: string | number) => ["activities", "detail", id] as const,
};

export function useActivitiesQuery(
  params: ListActivitiesParams = {},
  options: { enabled?: boolean } = {},
) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: activitiesKeys.list(params),
    enabled: options.enabled,

    queryFn: async () => {
      try {
        const { count, next, previous, results } =
          await fetchActivities(params);

        return {
          count,
          next,
          previous,
          activities: results.map(mapApiActivity),
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
    activities: query.data?.activities ?? [],
    count: query.data?.count ?? 0,
    hasNextPage: Boolean(query.data?.next),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useActivityQuery(id: string | number) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: activitiesKeys.detail(id),

    queryFn: async () => {
      try {
        const activity = await fetchActivity(id);

        return mapApiActivity(activity);
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
    activity: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
