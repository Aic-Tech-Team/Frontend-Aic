import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/HeroSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { ActivitiesSection } from "@/components/sections/ActivitiesSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { TeamsSection } from "@/components/sections/TeamsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { WhatYouExperienceSection } from "@/components/sections/WhatYouExperienceSection";

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
