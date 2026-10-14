import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing-sections/HeroSection";
import { TopicsMarquee } from "@/components/landing-sections/TopicsMarquee";
import { StatsSection } from "@/components/landing-sections/StatsSection";
import { EventsSection } from "@/components/landing-sections/EventsSection";
import { ActivitiesSection } from "@/components/landing-sections/ActivitiesSection";
import { BlogSection } from "@/components/landing-sections/BlogSection";
import { TeamsSection } from "@/components/landing-sections/TeamsSection";
import { CtaSection } from "@/components/landing-sections/CtaSection";
import { AboutSection } from "@/components/landing-sections/AboutSection";
import { WhatYouExperienceSection } from "@/components/landing-sections/WhatYouExperienceSection";

// Dynamic: a failed fetch must not be stored as this page.
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <StatsSection />
      <TopicsMarquee />
      <WhatYouExperienceSection />
      <AboutSection />
      <EventsSection />
      <ActivitiesSection />
      <BlogSection />
      <TeamsSection />
      <CtaSection />
    </>
  );
}
