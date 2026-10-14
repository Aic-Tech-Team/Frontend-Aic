import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ExperiencePanels } from "./ExperiencePanels";

export async function WhatYouExperienceSection() {
  const t = await getTranslations("Experience");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section id="experience" className="pb-12 pt-0 sm:pb-20">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
          align="center"
        />
        <Reveal direction="up">
          <ExperiencePanels items={items} />
        </Reveal>
      </div>
    </section>
  );
}
