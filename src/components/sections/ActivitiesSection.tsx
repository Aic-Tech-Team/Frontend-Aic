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
    <section id="activities" className="py-14 sm:py-20">
      <div className="container">
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
            <div
              key={groupIndex}
              className="grid h-full grid-rows-2 gap-3 sm:gap-4 lg:gap-5"
            >
              {group.map((item, i) => {
                const index = groupIndex * 2 + i;
                const Icon = icons[index] ?? icons[0];
                return (
                  <RevealItem
                    key={item.title}
                    direction="up"
                    hoverLift
                    delay={index * 0.06}
                    className="h-full min-h-0"
                  >
                    <AutoBorderGlow
                      className="h-full w-full"
                      borderRadius={20}
                      glowColor="270 90 75"
                      colors={["#c084fc", "#f472b6", "#38bdf8"]}
                      glowRadius={24}
                      glowIntensity={0.9}
                      coneSpread={25}
                      speed={6}
                      lightModeBoost={2.5}
                      phaseOffset={index * 90}
                    >
                      <div className="surface group flex h-full flex-row items-stretch gap-2.5 overflow-hidden rounded-2xl p-2.5 sm:gap-4 sm:p-3.5 lg:gap-5 lg:p-4">
                        <div className="relative aspect-square h-full w-auto max-w-[42%] shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={activityImages[index] ?? activityImages[0]}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1280px) 160px, (min-width: 1024px) 144px, (min-width: 768px) 112px, (min-width: 640px) 96px, 72px"
                            className="object-cover"
                          />
                          <Icon className="absolute bottom-1.5 start-1.5 h-3.5 w-3.5 text-white drop-shadow sm:bottom-2 sm:start-2 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        </div>

                        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-visible py-0.5">
                          <h3 className="line-clamp-2 text-[12px] font-bold leading-6 text-foreground sm:text-[13px] sm:leading-6 lg:text-sm lg:leading-7">
                            {item.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-muted-foreground sm:mt-1.5 sm:line-clamp-3 sm:text-[11px] sm:leading-5 lg:text-xs lg:leading-6">
                            {item.desc}
                          </p>
                          <div className="mt-auto pt-3 sm:pt-4">
                            <div className="flex items-center justify-between border-t border-border/50 pt-2 sm:pt-2.5">
                              <span className="min-w-0 truncate text-[10px] text-muted-foreground sm:text-[11px] lg:text-xs">
                                {item.date}
                              </span>
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 text-primary-300 transition-all duration-300 group-hover:bg-primary/10 group-hover:ltr:translate-x-1 group-hover:rtl:-translate-x-1 sm:h-7 sm:w-7">
                                <ChevronLeft className="h-3 w-3 ltr:rotate-180 sm:h-3.5 sm:w-3.5" />
                              </span>
                            </div>
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