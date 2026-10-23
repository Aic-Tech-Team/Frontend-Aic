import { CalendarCheck, Hourglass, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/ui/count-up";
import { getYearsActive } from "@/lib/utils";

export async function StatsSection() {
  const t = await getTranslations("Hero");

  const stats = [
    { label: t("statMembers"), value: 150, icon: Users },
    { label: t("statEvents"), value: 300, icon: CalendarCheck },
    { label: t("statYears"), value: getYearsActive(), icon: Hourglass },
  ];

  return (
    <section className="pt-4 sm:pt-8">
      <Reveal className="container min-w-0">
        <dl className="surface relative grid grid-cols-3 overflow-hidden rounded-2xl sm:rounded-3xl">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative flex min-w-0 flex-col items-center gap-1.5 px-1.5 py-5 text-center sm:gap-2 sm:px-3 sm:py-6 lg:flex-row lg:justify-center lg:gap-4 lg:px-5 lg:py-9 lg:text-start xl:gap-5 xl:px-6"
              >
                {i > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-5 inset-s-0 w-px bg-border/60 sm:inset-y-6 lg:inset-y-8"
                  />
                ) : null}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-300 sm:h-11 sm:w-11 sm:rounded-2xl lg:h-14 lg:w-14">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </span>
                <div className="min-w-0 max-w-full">
                  <dd>
                    <CountUp
                      end={stat.value}
                      suffix="+"
                      duration={2.2}
                      className="block text-2xl font-extrabold leading-none tracking-tight text-foreground sm:text-3xl lg:text-4xl xl:text-5xl"
                    />
                  </dd>
                  <dt className="mt-1.5 text-[10px] leading-4 text-muted-foreground sm:text-[11px] sm:leading-5 lg:mt-1 lg:text-sm lg:leading-6">
                    {stat.label}
                  </dt>
                </div>
              </div>
            );
          })}
        </dl>
      </Reveal>
    </section>
  );
}
