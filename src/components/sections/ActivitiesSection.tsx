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
              className="flex flex-col gap-3 sm:gap-4 lg:gap-5"
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
                    className="w-full"
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
                      <div className="surface group flex h-full flex-row items-stretch gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4 lg:gap-4 lg:p-4 xl:gap-5">
                        <div className="relative aspect-square w-28 shrink-0 self-start overflow-hidden rounded-xl sm:w-32 md:w-36 lg:w-32 xl:w-40 2xl:w-44">
                          <Image
                            src={activityImages[index] ?? activityImages[0]}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1536px) 176px, (min-width: 1280px) 160px, (min-width: 1024px) 128px, (min-width: 768px) 144px, (min-width: 640px) 128px, 112px"
                            className="object-cover"
                          />
                          <Icon className="absolute bottom-2 start-2 h-4 w-4 text-white drop-shadow sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col py-0.5">
                          <h3 className="line-clamp-2 break-words text-[12px] font-bold leading-6 text-foreground sm:text-[13px] sm:leading-7 lg:text-sm lg:leading-7">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 break-words text-[10px] leading-5 text-muted-foreground sm:mt-2 sm:line-clamp-3 sm:text-[11px] sm:leading-6 lg:text-xs lg:leading-6">
                            {item.desc}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 sm:mt-4 sm:pt-3">
                            <span className="min-w-0 truncate text-[10px] text-muted-foreground sm:text-[11px] lg:text-xs">
                              {item.date}
                            </span>
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 text-primary-300 transition-all duration-300 group-hover:bg-primary/10 group-hover:ltr:translate-x-1 group-hover:rtl:-translate-x-1 sm:h-7 sm:w-7">
                              <ChevronLeft className="h-3 w-3 ltr:rotate-180 sm:h-3.5 sm:w-3.5" />
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