import { contactHref } from "@/components/contact/intents";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";
import { SectionEyebrow } from "@/components/common/SectionEyebrow";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/animations/Reveal";
import { AboutMap } from "@/components/about/AboutMap";

export async function AboutHero() {
  const t = await getTranslations("AboutPage");
  const nav = await getTranslations("Nav");
  const hero = await getTranslations("Hero");
  const areas = t.raw("areas") as { title: string; desc: string }[];
  const facts = t.raw("facts") as { label: string; value: string }[];

  return (
    <section className="relative pb-10 pt-8 sm:pb-16 sm:pt-14">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(color-mix(in_srgb,var(--primary)_55%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div className="container min-w-0">
        <RevealGroup className="mx-auto max-w-4xl text-center" stagger={0.12}>
          <RevealItem>
            <SectionEyebrow className="mb-6">{t("eyebrow")}</SectionEyebrow>
          </RevealItem>
          <RevealItem>
            <h1 className="text-balance text-4xl font-black leading-[1.4] text-gradient sm:text-6xl sm:leading-[1.3] lg:text-7xl lg:leading-[1.25]">
              {t("heroA")}
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg font-bold leading-9 text-foreground/85 sm:text-2xl sm:leading-[1.9]">
              {t("heroB")}
            </p>
          </RevealItem>

          <RevealItem>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <GlareButton className="w-full sm:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full px-8 shadow-glow sm:w-auto"
                >
                  <Link href={contactHref("join")}>
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
          </RevealItem>
        </RevealGroup>

        <Reveal direction="up" delay={0.15} className="mt-12 sm:mt-16">
          <AboutMap
            areas={areas}
            facts={facts}
            lede={t("lede")}
            label={t("graphLabel")}
          />
        </Reveal>
      </div>
    </section>
  );
}
