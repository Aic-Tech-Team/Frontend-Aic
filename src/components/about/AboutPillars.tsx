import { getTranslations } from "next-intl/server";
import { ScrollText } from "@/components/animations/ScrollText";
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
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold leading-snug text-foreground sm:text-4xl lg:text-5xl">
            {t("pillarsTitle")}
          </h2>
          <ScrollText
            text={t("pillarsDescription")}
            className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg"
          />
        </div>
        <AboutTimeline items={items} next={next} />
      </div>
    </section>
  );
}
