import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";
import { Reveal } from "@/components/animations/Reveal";
import { FocusGraph } from "@/components/about/FocusGraph";

export async function AboutHero() {
  const t = await getTranslations("AboutPage");
  const nav = await getTranslations("Nav");
  const hero = await getTranslations("Hero");
  const areas = t.raw("areas") as { title: string; desc: string }[];

  return (
    <section className="pb-12 pt-10 sm:pb-20 sm:pt-16">
      <div className="container grid min-w-0 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal
          direction="up"
          className="min-w-0 text-center lg:text-start"
        >
          <h1 className="text-balance text-4xl font-extrabold leading-[1.4] tracking-tight text-foreground sm:text-5xl lg:text-5xl xl:text-6xl">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-base leading-9 text-muted-foreground sm:text-lg lg:mx-0">
            {t("lede")}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
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
        </Reveal>

        <Reveal direction="up" delay={0.1} className="min-w-0">
          <FocusGraph areas={areas} label={t("graphLabel")} />
        </Reveal>
      </div>
    </section>
  );
}
