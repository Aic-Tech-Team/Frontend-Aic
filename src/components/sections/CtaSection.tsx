import { ArrowLeft, Handshake } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/Reveal";
import { SectionBadge } from "@/components/common/SectionHeading";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";

export async function CtaSection() {
  const t = await getTranslations("Cta");

  return (
    <section id="join" className="px-4 py-6 pb-16 sm:px-6 sm:py-10 sm:pb-30">
      <Reveal direction="up" className="mx-auto max-w-6xl">
        <AutoBorderGlow
          className="w-full"
          borderRadius={40}
          glowColor="270 90 75"
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
          glowRadius={30}
          glowIntensity={0.9}
          coneSpread={25}
          speed={8}
          lightModeBoost={2.5}
        >
          <div className="surface relative w-full overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute -top-24 start-1/2 z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-500/25 blur-[100px]" />
            <div className="relative z-10">
              <div className="flex justify-center">
                <SectionBadge icon={Handshake}>{t("badge")}</SectionBadge>
              </div>

              <h2 className="mx-auto mt-5 max-w-xl text-2xl font-extrabold text-foreground sm:text-3xl">
                {t("title")}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {t("description")}
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-sm shadow-glow sm:w-auto"
                >
                  <a href="#join">
                    {t("join")}
                    <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-sm border-border/60 sm:w-auto"
                >
                  {t("partner")}
                </Button>
              </div>
            </div>
          </div>
        </AutoBorderGlow>
      </Reveal>
    </section>
  );
}
