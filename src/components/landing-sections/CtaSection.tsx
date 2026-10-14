import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Reveal } from "@/components/animations/Reveal";
import { Magnetic } from "@/components/animations/Magnetic";
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";
import { cn } from "@/lib/utils";

export async function CtaSection() {
  const t = await getTranslations("Cta");

  return (
    <section id="join" className="py-10 sm:py-20">
      <Reveal direction="up" className="container min-w-0">
        <AutoBorderGlow
          className="w-full"
          borderRadius={40}
          glowColor="270 90 75"
          colors={["#a78bfa", "#8b5cf6", "#7c3aed"]}
          glowRadius={30}
          glowIntensity={0.9}
          coneSpread={25}
          speed={6}
          lightModeBoost={2.5}
        >
          <div className="surface relative isolate w-full overflow-hidden rounded-[inherit] border-0 px-6 py-16 sm:px-14 sm:py-24 lg:px-20 lg:py-28">
            <span
              aria-hidden="true"
              dir="ltr"
              className="outline-text pointer-events-none absolute -bottom-[0.12em] left-1/2 -z-10 -translate-x-1/2 select-none text-[28vw] font-extrabold leading-none tracking-[0.12em] opacity-20 sm:text-[22vw] lg:text-[15rem]"
            >
              AIC
            </span>
            <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/30 blur-[100px]" />

            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <h2 className="text-pretty text-4xl font-extrabold leading-[1.35] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {t("title")}
              </h2>
              <p className="mt-6 max-w-[56ch] text-base leading-8 text-muted-foreground sm:text-lg">
                {t("description")}
              </p>

              <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Magnetic className="w-full sm:w-auto">
                  <GlareButton className="w-full sm:w-auto">
                    <a
                      href="#join"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-14 w-full rounded-full px-9 text-base shadow-glow sm:w-auto",
                      )}
                    >
                      {t("join")}
                      <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
                    </a>
                  </GlareButton>
                </Magnetic>
                <Magnetic className="w-full sm:w-auto">
                  <GlareButton className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 w-full rounded-full border-border/60 bg-background/30 px-9 text-base sm:w-auto"
                    >
                      {t("partner")}
                    </Button>
                  </GlareButton>
                </Magnetic>
              </div>
            </div>
          </div>
        </AutoBorderGlow>
      </Reveal>
    </section>
  );
}
