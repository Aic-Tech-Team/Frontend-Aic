import { api } from "@/services/api/client";
import { apiEndpoints } from "@/services/api/config";
import { resolveMediaUrl } from "@/services/api/media";

export interface PaginatedTeamsResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ListTeamsParams = {
  name?: string;
  responsibilities?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export interface ApiTeam {
  id: number;
  name: string;
  short_description?: string | null;
  responsibilities?: string | null;
  image?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeptHead {
  label: string;
  names: string[];
}

export interface TeamItem {
  id: number;
  name: string;
  role: string;
  team: string;
  bio: string;
  tasks: string[];
  heads?: DeptHead[];
  photo: string;
}

export async function fetchTeams(
  params: ListTeamsParams = {},
  opts: { revalidate?: number } = { revalidate: 300 },
): Promise<PaginatedTeamsResponse<ApiTeam>> {
  return api<PaginatedTeamsResponse<ApiTeam>>(apiEndpoints.teams.list(), {
    params,
    revalidate: opts.revalidate,
  });
}

function parseResponsibilities(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-–•*·]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
}

export function mapApiTeam(team: ApiTeam): TeamItem {
  return {
    id: team.id,
    name: team.name,
    role: "",
    team: team.name,
    bio: team.short_description ?? "",
    tasks: parseResponsibilities(team.responsibilities),
    photo: team.image ? resolveMediaUrl(team.image) : "/images/banner.jpg",
  };
}

export function sortTeams(teams: ApiTeam[]): ApiTeam[] {
  return [...teams].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || a.id - b.id,
  );
}
