import Image from "next/image";
import { ChevronLeft, HouseHeart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";

export async function AboutSection() {
  const t = await getTranslations("AboutSection");

  return (
    <section id="about" className="px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        <RevealGroup className="flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-start">
          <SectionHeading
            icon={HouseHeart}
            badge={t("badge")}
            title={t("title")}
            description={t("description")}
          />

          <RevealItem direction="right" className="mt-4">
            <p className="text-center text-sm leading-8 text-muted-foreground sm:text-base md:text-center lg:text-start">
              {t("body")}
            </p>
          </RevealItem>

          <RevealItem
            direction="right"
            className="mt-8 flex justify-center md:justify-center lg:justify-start"
          >
            <Button size="lg" className="rounded-xl shadow-glow">
              {t("cta")}
              <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
            </Button>
          </RevealItem>
        </RevealGroup>

        <Reveal direction="left" className="lg:order-1">
          <Image
            src="/images/Robot.svg"
            alt={t("imageAlt")}
            width={900}
            height={700}
            className="relative z-0 h-[420px] w-full object-cover sm:h-[520px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
