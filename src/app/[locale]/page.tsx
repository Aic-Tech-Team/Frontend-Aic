import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { EventsSection } from "@/components/sections/EventsSection";
import { ActivitiesSection } from "@/components/sections/ActivitiesSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { TeamsSection } from "@/components/sections/TeamsSection";
import { CtaSection } from "@/components/sections/CtaSection";


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
      <EventsSection />
      <ActivitiesSection />
      <BlogSection />
      <TeamsSection />
      <CtaSection />
    </>
  );
}
