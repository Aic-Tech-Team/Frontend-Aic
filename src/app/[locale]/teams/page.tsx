import { getTranslations, setRequestLocale } from "next-intl/server";
import { Layers } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import { TeamSlider } from "@/components/teams/TeamSlider";
import { listTeams } from "@/services/api/teams";
import type { TeamItem } from "@/types/team";

export const revalidate = 300;

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Teams");

  let teams: TeamItem[] = [];
  try {
    teams = await listTeams();
  } catch (error) {
    console.error("[teams] list failed:", error);
  }

  return (
    <div className="relative overflow-x-clip py-10 sm:py-16">
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
      </div>

      {teams.length === 0 ? (
        <div className="container relative mt-10 sm:mt-14">
          <ContentUnavailable />
        </div>
      ) : (
        <div className="relative mt-10 sm:mt-14">
          <TeamSlider teams={teams} ariaLabel={t("title")} />
        </div>
      )}
    </div>
  );
}
