import Image from "next/image";
import { CalendarClock, ChevronLeft, LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";

const icons = [LayoutGrid, CalendarClock, LayoutGrid, CalendarClock] as const;
const activityImages = [
  "/images/1088745278696137752.jpg",
  "/images/download - 2026-07-30T233837.402.jpg",
  "/images/Heewon on Instagram_ “Shout out to local pizza….jpg",
  "/images/So cute ___.jpg",
] as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    groups.push(arr.slice(i, i + size));
  }
  return groups;
}

export async function ActivitiesSection() {
  const t = await getTranslations("Activities");
  const common = await getTranslations("Common");
  const items = t.raw("items") as {
    title: string;
    desc: string;
    date: string;
  }[];

  const groups = chunk(items, 2);

  return (
    <section id="activities" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge={t("badge")}
          icon={CalendarClock}
          title={t("title")}
          description={t("description")}
          moreHref="#activities"
          moreLabel={common("more")}
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] lg:flex-[0_0_calc((100%-1.25rem)/2)]"
        >
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex h-full flex-col gap-6">
              {group.map((item, i) => {
                const index = groupIndex * 2 + i;
                const Icon = icons[index] ?? icons[0];
                return (
                  <RevealItem
                    key={item.title}
                    direction="up"
                    hoverLift
                    delay={index * 0.06}
                    className="h-full"
                  >
                    <AutoBorderGlow
                      className="h-full w-full"
                      borderRadius={24}
                      glowColor="270 90 75"
                      colors={["#c084fc", "#f472b6", "#38bdf8"]}
                      glowRadius={24}
                      glowIntensity={0.9}
                      coneSpread={25}
                      speed={6}
                      lightModeBoost={2.5}
                    >
                      <div className="surface group flex h-full gap-3 overflow-hidden rounded-3xl p-5 lg:p-6">
                        <div className="relative aspect-square w-35 shrink-0 self-start overflow-hidden rounded-2xl lg:w-44">
                          <Image
                            src={activityImages[index] ?? activityImages[0]}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 176px, 112px"
                            className="object-cover"
                          />
                          <Icon className="absolute bottom-2 inset-2 h-5 w-5 text-white drop-shadow lg:bottom-4 lg:inset-4 lg:h-8 lg:w-8" />
                        </div>

                        <div className="flex flex-1 flex-col">
                          <h3 className="text-sm font-bold text-foreground lg:text-lg">
                            {item.title}
                          </h3>
                          <p className="mt-2 flex-1 text-xs text-muted-foreground lg:text-sm">
                            {item.desc}
                          </p>
                          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                            <span className="text-xs text-muted-foreground lg:text-sm">
                              {item.date}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-primary-300 transition-all duration-300 group-hover:bg-primary/10 group-hover:ltr:translate-x-1 group-hover:rtl:-translate-x-1">
                              <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </AutoBorderGlow>
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