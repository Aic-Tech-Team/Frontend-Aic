import { CalendarCheck, Hourglass, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { StatCell } from "@/components/landing-sections/StatCell";
import { getYearsActive } from "@/lib/utils";

/**
 * The numbers as an open band, not a box: hairlines above and below with a light that sweeps
 * along the top, and under each figure a small bar chart that fills as it scrolls in.
 */
export async function StatsSection() {
  const t = await getTranslations("Hero");

  const stats = [
    { label: t("statMembers"), value: 150, icon: <Users />, fill: 0.74 },
    { label: t("statEvents"), value: 300, icon: <CalendarCheck />, fill: 0.9 },
    {
      label: t("statYears"),
      value: getYearsActive(),
      icon: <Hourglass />,
      fill: 0.38,
    },
  ];

  return (
    <section className="pt-6 sm:pt-12">
      <Reveal className="container min-w-0">
        <dl className="relative grid grid-cols-3">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent"
          />
          <span
            aria-hidden="true"
            className="stat-sweep absolute inset-x-0 top-0"
          />
          {/* faint radar rings behind the middle figure, echoing the globe above */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-s-1/2 top-1/2 -z-10 hidden size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 lg:block rtl:translate-x-1/2"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-s-1/2 top-1/2 -z-10 hidden size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/15 lg:block rtl:translate-x-1/2"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border/70 to-transparent"
          />
          {stats.map((stat, i) => (
            <StatCell key={stat.label} index={i} {...stat} />
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
