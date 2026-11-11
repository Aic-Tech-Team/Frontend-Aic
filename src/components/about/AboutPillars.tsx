import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/common/SectionHeading";
import { AboutTimeline } from "./AboutTimeline";

const IMAGES = [
  "/images/about/about-contest.jpg",
  "/images/about/about-conference.jpg",
  "/images/about/about-workshop.jpg",
  "/images/about/about-visit.jpg",
] as const;

export async function AboutPillars() {
  const t = await getTranslations("AboutPage");
  const items = (t.raw("semester") as { title: string; body: string }[]).map(
    (item, i) => ({ ...item, image: IMAGES[i] ?? IMAGES[0] }),
  );
  const next = t.raw("semesterNext") as { title: string; body: string; cta: string };

  return (
    <section className="py-14 sm:py-24">
      <div className="container">
        <SectionHeading
          align="center"
          badge={t("pillarsEyebrow")}
          title={t("pillarsTitle")}
          description={t("pillarsDescription")}
        />
        <AboutTimeline items={items} next={next} />
      </div>
    </section>
  );
}
