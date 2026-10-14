import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { Parallax } from "@/components/animations/Parallax";
import { ScrollText } from "@/components/animations/ScrollText";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";

export async function AboutSection() {
  const t = await getTranslations("AboutSection");

  return (
    <section id="about" className="py-12 sm:py-20">
      <div className="container grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <Reveal direction="up" className="min-w-0 text-center lg:text-start">
          {/* One shared column → title / body share the same inline edges */}
          <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            <h2 className="text-pretty text-2xl font-extrabold leading-snug tracking-tight text-foreground sm:text-3xl lg:text-4xl xl:text-5xl">
              {t("title")}
            </h2>
            <ScrollText
              text={t("description")}
              className="mt-6 w-full text-pretty text-sm leading-9 text-muted-foreground sm:text-base lg:text-lg lg:leading-10"
            />
            <ScrollText
              text={t("body")}
              className="mt-4 w-full text-pretty text-sm leading-9 text-muted-foreground sm:text-base lg:text-lg lg:leading-10"
            />
            <GlareButton className="mt-9 w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-full px-8 shadow-glow sm:w-auto"
              >
                {t("cta")}
                <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
              </Button>
            </GlareButton>
          </div>
        </Reveal>

        <Reveal direction="left" className="min-w-0">
          <Parallax distance={36}>
            <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-radial from-primary-500/40 via-primary-500/10 to-transparent to-70% blur-3xl"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[4%] rounded-full border border-primary/30"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[16%] rounded-full border border-dashed border-primary/25"
              />
              <Image
                src="/images/Robot.svg"
                alt={t("imageAlt")}
                width={900}
                height={700}
                className="relative z-10 h-full w-full scale-110 object-contain"
              />
            </div>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
