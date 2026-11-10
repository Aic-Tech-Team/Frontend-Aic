import { CalendarClock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { ActivityCardShell } from "@/components/landing-sections/ActivityCardShell";
import { ActivityRowCard } from "@/components/cards/ActivityRowCard";
import { getLandingActivities } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";

function chunk<T>(arr: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < arr.length; i += size)
    groups.push(arr.slice(i, i + size));
  return groups;
}

export async function ActivitiesSection() {
  const t = await getTranslations("Activities");
  const tPage = await getTranslations("ActivitiesPage");
  const common = await getTranslations("Common");
  const locale = await getLocale();
  const items = await getLandingActivities(locale);

  const heading = (
    <SectionHeading
      badge={t("badge")}
      icon={CalendarClock}
      title={t("title")}
      description={t("description")}
      moreHref="/activities"
      moreLabel={common("more")}
    />
  );

  if (items === null) {
    return (
      <section id="activities" className="py-12 sm:py-20">
        <div className="container">
          {heading}
          <ContentUnavailable className="mt-8" />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section id="activities" className="py-12 sm:py-20">
      <div className="container">
        {heading}
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] lg:flex-[0_0_calc((100%-1.25rem)/2)]"
        >
          {chunk(items, 2).map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-4 sm:gap-5">
              {group.map((item, i) => {
                const index = groupIndex * 2 + i;
                return (
                  <RevealItem key={item.id} direction="up" delay={index * 0.06} fade={0.35} className="w-full">
                    <ActivityCardShell phaseOffset={index * 90}>
                      <ActivityRowCard
                        item={item}
                        index={index}
                        locale={locale}
                        ctaLabel={tPage("learnMore")}
                      />
                    </ActivityCardShell>
                  </RevealItem>
                );
              })}
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
