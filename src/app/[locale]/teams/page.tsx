import { getTranslations, setRequestLocale } from "next-intl/server";
import { Layers } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { TeamSlider } from "@/components/teams/TeamSlider";
import { ApiError } from "@/services/api/client";
import { fetchTeams, mapApiTeam, sortTeams, type ApiTeam } from "@/types/teams";

export const revalidate = 300;

const TEAMS_PAGE_SIZE = 100;

async function loadTeams(): Promise<ApiTeam[] | null> {
  try {
    const res = await fetchTeams({ page_size: TEAMS_PAGE_SIZE });
    return Array.isArray(res?.results) ? res.results : [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    console.error("[teams] failed to load teams:", error);
    return null;
  }
}

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Teams");
  const teams = await loadTeams();
  const members = teams ? sortTeams(teams).map(mapApiTeam) : [];

  return (
    <div className="relative overflow-clip py-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(color-mix(in_srgb,var(--muted-foreground)_22%,transparent)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_45%_at_50%_0%,black,transparent)]"
      />

      <div className="container relative">
        <SectionHeading
          badge={t("badge")}
          icon={Layers}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        <div className="mt-10 sm:mt-14">
          {members.length > 0 ? (
            <TeamSlider
              members={members}
              tasksLabel={t("responsibilitiesLabel")}
            />
          ) : (
            <ContentUnavailable />
          )}
        </div>
      </div>
    </div>
  );
}
