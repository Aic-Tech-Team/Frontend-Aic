import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { ScrollText } from "@/components/animations/ScrollText";

export async function AboutManifesto() {
  const t = await getTranslations("AboutPage");
  const facts = t.raw("facts") as { label: string; value: string }[];

  return (
    <section className="py-16 sm:py-28">
      <div className="container">
        <ScrollText
          text={t("manifesto")}
          className="mx-auto max-w-5xl text-balance text-center text-2xl font-extrabold leading-[1.9] text-foreground sm:text-4xl sm:leading-[1.8] lg:text-5xl lg:leading-[1.7]"
        />

        <Reveal direction="up" className="mx-auto mt-14 max-w-4xl sm:mt-20">
          <dl className="grid gap-8 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="border-t border-border/70 pt-5">
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="mt-2 text-lg font-extrabold leading-8 text-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
