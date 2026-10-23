import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutManifesto } from "@/components/about/AboutManifesto";
import { AboutPillars } from "@/components/about/AboutPillars";
import { TeamsSection } from "@/components/landing-sections/TeamsSection";
import { CtaSection } from "@/components/landing-sections/CtaSection";

// Teams come from the API; a failed fetch must not be stored as this page.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  return { title: t("title"), description: t("lede") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AboutHero />
      <AboutManifesto />
      <AboutPillars />
      <TeamsSection />
      <CtaSection />
    </>
  );
}
