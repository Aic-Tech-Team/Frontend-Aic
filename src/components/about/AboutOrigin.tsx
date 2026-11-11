import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { Parallax } from "@/components/animations/Parallax";
import { SectionHeading } from "@/components/common/SectionHeading";

export async function AboutOrigin() {
  const t = await getTranslations("AboutPage");
  const locale = await getLocale();
  const chapters = t.raw("origin") as string[];
  const steps = t.raw("originSteps") as string[];

  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <SectionHeading
          align="center"
          badge={t("originEyebrow")}
          title={t("originTitle")}
          description={t("originLead")}
        />

        <div className="relative">
          <Reveal direction="up">
            <div className="relative overflow-hidden rounded-3xl border border-border/50 shadow-glow">
              <div className="relative aspect-4/3 overflow-hidden sm:aspect-video lg:aspect-[21/9]">
                <Parallax distance={40} className="absolute inset-x-0 -top-[10%] h-[120%]">
                  <Image
                    src="/images/about/about-origin.jpg"
                    alt=""
                    width={1024}
                    height={576}
                    className="h-full w-full object-cover"
                  />
                </Parallax>
              </div>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/20 to-background/30"
              />
              <p className="absolute end-5 top-3 text-6xl font-extrabold leading-none text-transparent outline-text-photo sm:end-10 sm:top-6 sm:text-8xl lg:text-9xl">
                {t("originYear")}
              </p>
            </div>
          </Reveal>

          {/* three chapters on a glass panel that rides up over the picture */}
          <RevealGroup className="relative z-10 mx-3 -mt-20 sm:mx-8 sm:-mt-28 lg:mx-14 lg:-mt-32">
            <RevealItem>
              <ol className="surface relative grid overflow-hidden rounded-3xl bg-[color-mix(in_srgb,var(--background)_90%,transparent)] md:grid-cols-3">
                {chapters.map((text, i) => {
                  const last = i === chapters.length - 1;
                  return (
                    <li
                      key={text}
                      className="group relative p-6 transition-colors duration-500 hover:bg-primary/5 sm:p-8 max-md:border-b max-md:border-border/50 max-md:last:border-b-0 md:border-s md:border-border/50 md:first:border-s-0"
                    >
                      {/* the path across the top: filled for what is behind us, dashed for what is still open */}
                      <span
                        aria-hidden="true"
                        className={
                          last
                            ? "absolute inset-x-0 top-0 h-px border-t border-dashed border-primary/50"
                            : "absolute inset-x-0 top-0 h-px bg-linear-to-r from-primary to-primary/60 rtl:bg-linear-to-l"
                        }
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -top-px start-6 h-0.5 w-0 bg-primary-300 shadow-[0_0_12px_var(--primary)] transition-[width] duration-500 group-hover:w-16 sm:start-8"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-5xl font-black leading-none text-transparent outline-text opacity-70 sm:text-6xl">
                          {(i + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
                        </span>
                        {last ? (
                          <span className="relative mt-1 flex size-3" aria-hidden="true">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-300/70 motion-reduce:hidden" />
                            <span className="relative inline-flex size-3 rounded-full bg-primary-300" />
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-5 text-lg font-extrabold leading-snug text-foreground sm:text-xl">{steps[i]}</h3>
                      <p className="mt-3 text-base leading-9 text-muted-foreground">{text}</p>
                    </li>
                  );
                })}
              </ol>
            </RevealItem>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
