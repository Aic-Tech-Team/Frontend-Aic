import { getLocale, getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { EventPosterCard } from "@/components/cards/EventPosterCard";
import { getLandingEvents } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";

export async function EventsSection() {
  const t = await getTranslations("Events");
  const common = await getTranslations("Common");
  const locale = await getLocale();
  const events = await getLandingEvents(locale);

  const heading = (
    <SectionHeading
      badge={t("badge")}
      title={t("title")}
      description={t("description")}
      moreHref="/events"
      moreLabel={common("more")}
    />
  );

  if (events === null) {
    return (
      <section id="events" className="py-12 sm:py-20">
        <div className="container min-w-0">
          {heading}
          <ContentUnavailable className="mt-8" />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  const detailsCta = t("detailsCta");

  return (
    <section id="events" className="py-12 sm:py-20">
      <div className="container min-w-0">
        {heading}
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_88%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
        >
          {events.map((event, index) => (
            <RevealItem key={event.id} direction="up" delay={index * 0.06} className="h-full">
              <EventPosterCard
                event={event}
                locale={locale}
                ctaLabel={detailsCta}
                href={`/events/${event.id}`}
              />
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
