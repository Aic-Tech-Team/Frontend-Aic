import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { TeamExplorer } from "@/components/teams/TeamExplorer";
import { TeamsHero } from "@/components/teams/TeamsHero";
import { param, type SearchParams } from "@/lib/search-params";
import { listTeams } from "@/services/api/teams";

export const dynamic = "force-dynamic";

export default async function TeamsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const initialId = param(await searchParams, "team");
  setRequestLocale(locale);

  const t = await getTranslations("Teams");
  const teams = (await listTeams()) ?? [];

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <TeamsHero />
      </div>

      {teams.length === 0 ? (
        <div className="container">
          <ContentUnavailable />
        </div>
      ) : (
        <TeamExplorer teams={teams} ariaLabel={t("title")} initialId={initialId} />
      )}
    </div>
  );
}
