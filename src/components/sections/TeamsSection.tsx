import {
  Globe2,
  Code2,
  Megaphone,
  CalendarRange,
  GraduationCap,
  Users2,
  Layers,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";

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
          slideClassName="max-sm:flex-[0_0_100%] flex-[0_0_calc((100%-1rem)/2)] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/4)]"
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
                <div className="surface group flex h-full flex-col items-center rounded-2xl p-4 text-center sm:rounded-3xl sm:p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500/25 to-primary-700/10 text-primary-300 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary-500 sm:h-14 sm:w-14 dark:group-hover:text-primary-200">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-foreground sm:mt-4 sm:text-base">
                    {team.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-muted-foreground sm:text-[13px]">
                    {team.desc}
                  </p>
                  <span className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {t("membersLabel", { count: members })}
                    <Users2 className="h-3.5 w-3.5 text-primary-300" />
                  </span>
                </div>
              </RevealItem>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
