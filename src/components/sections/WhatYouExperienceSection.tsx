
import { BookMarked, BookOpen, Microscope, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";

const icons = [Trophy, BookMarked, BookOpen, Microscope] as const;
const tones = [
  "text-amber-400 bg-amber-500/10",
  "text-fuchsia-400 bg-fuchsia-500/10",
  "text-violet-400 bg-violet-500/10",
  "text-sky-400 bg-sky-500/10",
] as const;

export async function WhatYouExperienceSection() {
  const t = await getTranslations("Experience");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section id="experience" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge={t("badge")}
          icon={Trophy}
          title={t("title")}
          description={t("description")}
          align="center"
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="max-[380px]:flex-[0_0_100%] flex-[0_0_calc((100%-1rem)/2)] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/4)]"
        >
          {items.map((item, index) => {
            const Icon = icons[index] ?? Trophy;
            return (
              <RevealItem
                key={item.title}
                direction="up"
                hoverLift
                delay={index * 0.06}
                className="h-full"
              >
                <div className="surface flex h-full flex-col items-center rounded-3xl p-6 text-center">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[index] ?? tones[0]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
