import { Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { TeamCard } from "@/components/teams/TeamCard";
import { getLandingTeams } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";

export async function TeamsSection() {
  const t = await getTranslations("Teams");
  const common = await getTranslations("Common");
  const teams = await getLandingTeams();

  if (teams === null) {
    return (
      <section id="teams" className="py-14 sm:py-20">
        <div className="container">
          <SectionHeading
            badge={t("badge")}
            icon={Layers}
            title={t("title")}
            description={t("description")}
            align="center"
            moreHref="/teams"
            moreLabel={common("more")}
          />
          <ContentUnavailable className="mt-8" />
        </div>
      </section>
    );
  }

  if (teams.length === 0) return null;

  return (
    <section id="teams" className="py-14 sm:py-20">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Layers}
          title={t("title")}
          description={t("description")}
          align="center"
          moreHref="/teams"
          moreLabel={common("more")}
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_82%] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/4)]"
        >
          {teams.map((team, index) => (
            <RevealItem
              key={team.id}
              direction="up"
              delay={index * 0.06}
              className="h-full"
            >
              <TeamCard
                team={team}
                index={index}
                ctaLabel={t("exploreTeam")}
                className="h-full"
              />
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
