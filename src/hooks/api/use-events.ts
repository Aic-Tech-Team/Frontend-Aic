"use client";

import { useQuery } from "@tanstack/react-query";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { fetchEvent, fetchEvents, ListEventsParams, mapApiEvent } from "./events";

export const eventsKeys = {
  all: ["events"] as const,
  list: (params: ListEventsParams) => ["events", "list", params] as const,
  detail: (id: string | number) => ["events", "detail", id] as const,
};

export function useEventsQuery(params: ListEventsParams = {}) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: eventsKeys.list(params),

    queryFn: async () => {
      try {
        const { count, next, previous, results } =
          await fetchEvents(params);

        return {
          count,
          next,
          previous,
          events: results.map(mapApiEvent),
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
    events: query.data?.events ?? [],
    count: query.data?.count ?? 0,
    hasNextPage: Boolean(query.data?.next),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useEventQuery(id: string | number) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: eventsKeys.detail(id),

    queryFn: async () => {
      try {
        const event = await fetchEvent(id);

        return mapApiEvent(event);
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
    event: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}