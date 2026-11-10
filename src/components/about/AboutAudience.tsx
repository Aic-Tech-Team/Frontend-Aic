import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { AudienceTabs } from "@/components/about/AudienceTabs";

export async function AboutAudience() {
  const t = await getTranslations("AboutPage");
  const people = t.raw("audience") as { title: string; body: string }[];

  return (
    <section className="py-14 sm:py-24">
      <div className="container">
        <SectionHeading
          align="center"
          badge={t("audienceEyebrow")}
          title={t("audienceTitle")}
          description={t("audienceLead")}
        />
        <Reveal direction="up">
          <AudienceTabs people={people} />
        </Reveal>
      </div>
    </section>
  );
}
