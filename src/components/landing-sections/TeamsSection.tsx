import {
  Globe2,
  Code2,
  Megaphone,
  CalendarRange,
  GraduationCap,
  Layers,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { TeamCard } from "@/components/teams/TeamCard";

const icons = [Globe2, Code2, Megaphone, CalendarRange, GraduationCap] as const;
const memberCounts = [4, 5, 7, 6, 8] as const;

export async function TeamsSection() {
  const t = await getTranslations("Teams");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section id="teams" className="py-14 sm:py-20">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={Layers}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_82%] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/4)]"
        >
          {items.map((team, index) => {
            const Icon = icons[index] ?? Globe2;
            const members = memberCounts[index] ?? 0;
            return (
              <RevealItem
                key={team.title}
                direction="up"
                hoverLift
                delay={index * 0.06}
                className="h-full"
              >
                <TeamCard
                  icon={Icon}
                  index={index}
                  title={team.title}
                  desc={team.desc}
                  membersText={t("membersLabel", { count: members })}
                  className="h-full"
                />
              </RevealItem>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
