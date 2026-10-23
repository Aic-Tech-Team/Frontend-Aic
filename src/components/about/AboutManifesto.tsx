import { getLocale, getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { ScrollText } from "@/components/animations/ScrollText";

export async function AboutManifesto() {
  const t = await getTranslations("AboutPage");
  const locale = await getLocale();
  const principles = t.raw("principles") as { title: string; body: string }[];

  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <Reveal direction="up">
          <div className="surface relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-12 sm:py-16 lg:px-20 lg:py-20">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -start-24 -top-24 size-80 rounded-full bg-primary/25 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -end-24 size-96 rounded-full bg-primary-300/15 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute end-6 top-2 select-none text-[9rem] font-black leading-none text-primary/15 sm:end-12 sm:text-[14rem]"
            >
              &ldquo;
            </span>
            <ScrollText
              as="h2"
              text={t("manifesto")}
              className="relative mx-auto max-w-4xl text-balance text-center text-xl font-extrabold leading-[2] text-foreground sm:text-2xl sm:leading-[2] lg:text-3xl lg:leading-[2]"
            />
          </div>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {principles.map((item, i) => (
            <RevealItem key={item.title}>
              <div className="relative h-full border-t border-border/60 pt-6 md:px-8 md:first:ps-0 md:last:pe-0 md:[&:not(:first-child)]:border-s">
                <span className="block text-5xl font-extrabold leading-none text-transparent outline-text opacity-70">
                  {(i + 1).toLocaleString(locale, {
                    minimumIntegerDigits: 2,
                  })}
                </span>
                <h3 className="mt-4 text-xl font-extrabold leading-snug text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-8 text-muted-foreground">{item.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
