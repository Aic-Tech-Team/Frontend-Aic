import { api } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { resolveMediaUrl } from "@/services/api/media";
import type { PaginatedResponse } from "@/services/api/types";
import type { TeamItem } from "@/types/team";

export interface ApiTeam {
  id: number;
  name: string;
  short_description?: string;
  responsibilities?: string;
  image?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchTeams(
  params: { page?: number; page_size?: number } = {},
  opts: { revalidate?: number } = { revalidate: 300 },
): Promise<PaginatedResponse<ApiTeam>> {
  return api<PaginatedResponse<ApiTeam>>(apiEndpoints.teams.list(), {
    params,
    revalidate: opts.revalidate,
  });
}

export function mapApiTeam(team: ApiTeam): TeamItem {
  return {
    id: String(team.id),
    name: team.name,
    shortDescription: team.short_description?.trim() || "",
    responsibilities: splitLines(team.responsibilities),
    image: resolveMediaUrl(team.image),
  };
}

/** Sorted + mapped list for pages (throws on API failure). */
export async function listTeams(pageSize = 50): Promise<TeamItem[]> {
  const res = await fetchTeams({ page_size: pageSize });
  return mapTeamRows(res?.results);
}

/** Soft-safe mapper for landing / already-fetched rows. */
export function mapTeamRows(rows: ApiTeam[] | null | undefined): TeamItem[] {
  if (!Array.isArray(rows)) return [];
  return [...rows]
    .sort((a, b) => {
      const order = (a.display_order ?? 1e9) - (b.display_order ?? 1e9);
      return order || a.id - b.id;
    })
    .map(mapApiTeam);
}

function splitLines(raw?: string | null): string[] {
  const text = raw?.trim();
  if (!text) return [];
  const parts = text
    .split(/\r?\n|[;؛]/)
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  return parts.length ? parts : [text];
}
