import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Ticket,
  User,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import ElectricBorder from "@/components/animations/ElectricBorder";
import { Carousel } from "@/components/common/Carousel";
import { getLandingEvents } from "@/services/api/landing";

export async function EventsSection() {
  const t = await getTranslations("Events");
  const common = await getTranslations("Common");
  const events = await getLandingEvents();

  if (events.length === 0) return null;

  return (
    <section id="events" className="py-10 sm:py-20">
      <div className="container min-w-0">
        <SectionHeading
          badge={t("badge")}
          icon={Ticket}
          title={t("title")}
          description={t("description")}
          moreHref="/events"
          moreLabel={common("more")}
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)]"
        >
          {events.map((event, index) => (
            <RevealItem key={event.id} direction="up" delay={index * 0.06}>
              <div className="group aspect-square w-full [perspective:1400px]">
                <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
                  <div className="pointer-events-none absolute inset-0 z-10">
                    <ElectricBorder
                      color="#7b2cc8"
                      speed={0.9}
                      chaos={0.01}
                      style={{ borderRadius: 24 }}
                      className="h-full w-full"
                    />
                  </div>

                  <div className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl [backface-visibility:hidden]">
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden">
                      <Image
                        src={event.image || "/images/qq.jpg"}
                        alt={event.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-lg font-bold leading-7 text-white">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                          {event.dateLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="surface absolute inset-0 flex flex-col rounded-3xl p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div className="min-h-0 flex-1">
                      <h3 className="line-clamp-2 wrap-break-word text-base font-bold leading-7 text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-2 line-clamp-5 wrap-break-word text-sm leading-7 text-muted-foreground">
                        {event.desc}
                      </p>
                    </div>

                    <div className="mt-3 shrink-0 space-y-2">
                      <div className="overflow-hidden rounded-xl bg-muted/55 ring-1 ring-border/35">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                          <span className="truncate font-medium text-foreground">
                            {event.dateLabel}
                          </span>
                        </div>

                        {event.location ? (
                          <div className="flex items-center gap-2 border-t border-border/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                            <span className="truncate font-medium text-foreground">
                              {event.location}
                            </span>
                          </div>
                        ) : null}

                        {event.speaker ? (
                          <div className="flex items-center gap-2 border-t border-border/40 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                            <span className="truncate font-medium text-foreground">
                              {event.speaker}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="h-9 w-full rounded-xl text-xs shadow-none"
                      >
                        <Link href={`/events/${event.id}`}>
                          {t("detailsCta")}
                          <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
