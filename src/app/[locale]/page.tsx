import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing-sections/HeroSection";
import { EventsSection } from "@/components/landing-sections/EventsSection";
import { ActivitiesSection } from "@/components/landing-sections/ActivitiesSection";
import { BlogSection } from "@/components/landing-sections/BlogSection";
import { TeamsSection } from "@/components/landing-sections/TeamsSection";
import { CtaSection } from "@/components/landing-sections/CtaSection";
import { AboutSection } from "@/components/landing-sections/AboutSection";
import { WhatYouExperienceSection } from "@/components/landing-sections/WhatYouExperienceSection";

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
