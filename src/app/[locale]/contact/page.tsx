import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContactPage" });
  return { title: t("title"), description: t("lede") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");

  return (
    <section className="pb-16 pt-10 sm:pb-24 sm:pt-16">
      <div className="container grid min-w-0 gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
        <Reveal
          direction="up"
          className="min-w-0 text-center lg:pt-6 lg:text-start"
        >
          <h1 className="text-balance text-4xl font-extrabold leading-[1.4] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-6 max-w-[50ch] text-pretty text-base leading-9 text-muted-foreground sm:text-lg lg:mx-0">
            {t("lede")}
          </p>
          <div className="mt-10 text-start lg:mt-14">
            <ContactChannels />
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.1} className="min-w-0 pt-10">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
