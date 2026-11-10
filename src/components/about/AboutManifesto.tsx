import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrincipleCards } from "@/components/about/PrincipleCards";

export async function AboutManifesto() {
  const t = await getTranslations("AboutPage");
  const principles = t.raw("principles") as { title: string; body: string }[];

  return (
    <section className="relative py-14 sm:py-24">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-10 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl rtl:translate-x-1/2"
      />
      <div className="container">
        <SectionHeading
          align="center"
          badge={t("manifestoEyebrow")}
          title={t("manifestoTitle")}
          description={t("manifesto")}
        />

        <div className="mt-8 sm:mt-10">
          <PrincipleCards principles={principles} />
        </div>
      </div>
    </section>
  );
}
