"use client";

import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  fetchTeams,
  type ListTeamsParams,
  mapApiTeam,
  sortTeams,
} from "@/types/teams";

export const teamsKeys = {
  all: ["teams"] as const,
  list: (params: ListTeamsParams) => ["teams", "list", params] as const,
};

export function useTeamsQuery(
  params: ListTeamsParams = {},
  options: { enabled?: boolean } = {},
) {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: teamsKeys.list(params),
    enabled: options.enabled,

    queryFn: async () => {
      try {
        const { count, next, previous, results } = await fetchTeams(params, {
          revalidate: undefined,
        });

        return {
          count,
          next,
          previous,
          teams: sortTeams(results).map(mapApiTeam),
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
    teams: query.data?.teams ?? [],
    count: query.data?.count ?? 0,
    hasNextPage: Boolean(query.data?.next),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
