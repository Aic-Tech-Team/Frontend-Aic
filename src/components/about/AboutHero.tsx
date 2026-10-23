import { ArrowLeft, CalendarDays, Landmark, Route } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";
import { FocusGraph } from "@/components/about/FocusGraph";

const FACT_ICONS = [CalendarDays, Landmark, Route] as const;

export async function AboutHero() {
  const t = await getTranslations("AboutPage");
  const nav = await getTranslations("Nav");
  const hero = await getTranslations("Hero");
  const areas = t.raw("areas") as { title: string; desc: string }[];
  const facts = t.raw("facts") as { label: string; value: string }[];

  return (
    <section className="relative pb-8 pt-6 sm:pb-12 sm:pt-8">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(color-mix(in_srgb,var(--primary)_55%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div className="container grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-[1.45] tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem] lg:leading-[1.4]">
            {t("headline")}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
            {t("lede")}
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row">
            <GlareButton className="w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-full px-8 shadow-glow sm:w-auto"
              >
                <Link href="/#join">
                  {nav("join")}
                  <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
                </Link>
              </Button>
            </GlareButton>
            <GlareButton className="w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-full border-border/60 bg-background/30 px-8 sm:w-auto"
              >
                <Link href="/events">{hero("ctaEvents")}</Link>
              </Button>
            </GlareButton>
          </div>
        </div>

        <div className="relative min-w-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[18%] -z-10 rounded-full bg-primary-500/20 blur-3xl"
          />
          <FocusGraph areas={areas} label={t("graphLabel")} />
        </div>
      </div>

      <div className="container mt-8 sm:mt-10">
        <dl className="grid gap-4 lg:grid-cols-3">
          {facts.map((fact, i) => {
            const Icon = FACT_ICONS[i] ?? CalendarDays;
            return (
              <div
                key={fact.label}
                className="surface group relative flex items-center gap-4 overflow-hidden rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-8 -top-8 size-28 rounded-full bg-primary/20 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-300 ring-1 ring-primary/30">
                  <Icon className="size-6" />
                </span>
                <div className="relative min-w-0">
                  <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-1 text-lg font-extrabold leading-snug text-foreground">
                    {fact.value}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
