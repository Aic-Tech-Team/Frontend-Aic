import Image from "next/image";
import { ArrowLeft, CalendarClock, LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { ActivityCardShell } from "@/components/landing-sections/ActivityCardShell";
import { getLandingActivities } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import type { ActivityItem } from "@/types/activity";

const ICONS = [LayoutGrid, CalendarClock] as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < arr.length; i += size) groups.push(arr.slice(i, i + size));
  return groups;
}

function ActivityCard({ item, index }: { item: ActivityItem; index: number }) {
  const Icon = ICONS[index % ICONS.length];

  return (
    <RevealItem direction="up" delay={index * 0.06} className="w-full">
      <ActivityCardShell phaseOffset={index * 90}>
        <Link
          href={`/activities/${item.id}`}
          className="surface group flex h-full cursor-pointer items-stretch overflow-hidden rounded-3xl border border-border/40 md:rounded-[inherit] md:border-0"
        >
          <div className="relative aspect-4/5 w-28 shrink-0 overflow-hidden sm:aspect-square sm:w-40">
            <Image
              src={item.image || "/images/qq.jpg"}
              alt={item.title}
              fill
              unoptimized
              sizes="(min-width: 640px) 160px, 112px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <span className="absolute bottom-2 inset-s-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-sm sm:bottom-3 sm:inset-s-3 sm:h-9 sm:w-9">
              <Icon className="h-4 w-4" />
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4 sm:pe-4 sm:ps-5">
            <h3 className="line-clamp-2 text-base font-extrabold leading-7 text-foreground transition-colors group-hover:text-primary-300 sm:text-lg">
              {item.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground sm:mt-1.5 sm:line-clamp-3 sm:text-sm sm:leading-7">
              {item.summary}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
              <span className="min-w-0 truncate rounded-full bg-muted/70 px-3 py-1 text-[11px] text-muted-foreground sm:text-xs">
                {item.dateLabel}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-300 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
              </span>
            </div>
          </div>
        </Link>
      </ActivityCardShell>
    </RevealItem>
  );
}

export async function ActivitiesSection() {
  const t = await getTranslations("Activities");
  const common = await getTranslations("Common");
  const items = await getLandingActivities();

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
              {group.map((item, i) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  index={groupIndex * 2 + i}
                />
              ))}
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
